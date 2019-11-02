/*  gngeo a neogeo emulator
 *  Copyright (C) 2001 Peponas Mathieu
 * 
 *  This program is free software; you can redistribute it and/or modify  
 *  it under the terms of the GNU General Public License as published by   
 *  the Free Software Foundation; either version 2 of the License, or    
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Library General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA. 
 */

#ifdef HAVE_CONFIG_H
#include <config.h>
#endif

#ifdef __EMSCRIPTEN__
#include "emscripten.h"
#endif

#include "SDL.h"

#include <string.h>
#include <stdlib.h>
#include <time.h>

#include "emu.h"
#include "memory.h"
#include "frame_skip.h"
#include "pd4990a.h"
#include "messages.h"
#include "profiler.h"
#include "debug.h"

#include "timer.h"
//#include "streams.h"
#include "sound.h"
#include "screen.h"
#include "neocrypt.h"
#include "conf.h"
//#include "driver.h"
//#include "gui_interf.h"
#ifdef FULL_GL
#include "videogl.h"
#endif
#include "menu.h"
#include "event.h"

int frame;
int nb_interlace = 256;
int current_line;
//static int arcade;
//
//extern int irq2enable, irq2start, irq2repeat, irq2control, irq2taken;
//extern int lastirq2line;
//extern int irq2repeat_limit;
//extern Uint32 irq2pos_value;

void setup_misc_patch(char *name) {


	if (!strcmp(name, "ssideki")) {
		WRITE_WORD_ROM(&memory.rom.cpu_m68k.p[0x2240], 0x4e71);
	}

	//if (!strcmp(name, "fatfury3")) {
	//	WRITE_WORD_ROM(memory.rom.cpu_m68k.p, 0x0010);
	//}

	if (!strcmp(name, "mslugx")) {
		/* patch out protection checks */
		int i;
		Uint8 *RAM = memory.rom.cpu_m68k.p;
		for (i = 0; i < memory.rom.cpu_m68k.size; i += 2) {
			if ((READ_WORD_ROM(&RAM[i + 0]) == 0x0243)
					&& (READ_WORD_ROM(&RAM[i + 2]) == 0x0001) && /* andi.w  #$1, D3 */
			(READ_WORD_ROM(&RAM[i + 4]) == 0x6600)) { /* bne xxxx */

				WRITE_WORD_ROM(&RAM[i + 4], 0x4e71);
				WRITE_WORD_ROM(&RAM[i + 6], 0x4e71);
			}
		}

		WRITE_WORD_ROM(&RAM[0x3bdc], 0x4e71);
		WRITE_WORD_ROM(&RAM[0x3bde], 0x4e71);
		WRITE_WORD_ROM(&RAM[0x3be0], 0x4e71);
		WRITE_WORD_ROM(&RAM[0x3c0c], 0x4e71);
		WRITE_WORD_ROM(&RAM[0x3c0e], 0x4e71);
		WRITE_WORD_ROM(&RAM[0x3c10], 0x4e71);

		WRITE_WORD_ROM(&RAM[0x3c36], 0x4e71);
		WRITE_WORD_ROM(&RAM[0x3c38], 0x4e71);
	}

}

void neogeo_reset(void) {
    //	memory.vid.modulo = 1; /* TODO: Move to init_video */
	sram_lock = 0;
	sound_code = 0;
	pending_command = 0;
	result_code = 0;
#ifdef ENABLE_940T
	shared_ctl->sound_code = sound_code;
	shared_ctl->pending_command = pending_command;
	shared_ctl->result_code = result_code;
#endif
	if (memory.rom.cpu_m68k.size > 0x100000)
		cpu_68k_bankswitch(0x100000);
	else
		cpu_68k_bankswitch(0);
	cpu_68k_reset();

}

void init_neo(void) {
#ifdef ENABLE_940T
	int z80_overclk = CF_VAL(cf_get_item_by_name("z80clock"));
#endif

	neogeo_init_save_state();

	cpu_68k_init();
//	neogeo_reset();
	pd4990a_init();
//	setup_misc_patch(rom_name);

	neogeo_reset();
}

static void take_screenshot(void) {
	time_t ltime;
	struct tm *today;
	char buf[256];
	char date_str[101];
	//static SDL_Rect buf_rect    =	{16, 16, 304, 224};
	static SDL_Rect screen_rect = { 0, 0, 304, 224 };
	static SDL_Surface *shoot;

	screen_rect.w = visible_area.w;
	screen_rect.h = visible_area.h;

	if (shoot == NULL)
		shoot = SDL_CreateRGBSurface(SDL_SWSURFACE, visible_area.w,
				visible_area.h, 16, 0xF800, 0x7E0, 0x1F, 0);

	time(&ltime);
	today = localtime(&ltime);
	strftime(date_str, 100, "%a_%b_%d_%T_%Y", today);
	snprintf(buf, 255, "%s/%s_%s.bmp", getenv("HOME"), conf.game, date_str);
	printf("save to %s\n", buf);

	SDL_BlitSurface(buffer, &visible_area, shoot, &screen_rect);
	SDL_SaveBMP(shoot, buf);
}

static int fc;
static int last_line;
static int skip_this_frame = 0;

static inline int neo_interrupt(void) {
    static int frames;

	pd4990a_addretrace();
	// printf("neogeo_frame_counter_speed %d\n",neogeo_frame_counter_speed);
	if (!(memory.vid.irq2control & 0x8)) {
		if (fc >= neogeo_frame_counter_speed) {
			fc = 0;
			neogeo_frame_counter++;
		}
		fc++;
	}

	skip_this_frame = skip_next_frame;
	skip_next_frame = frame_skip(0);

	if (!skip_this_frame) {
		PROFILER_START(PROF_VIDEO);

		draw_screen();

		PROFILER_STOP(PROF_VIDEO);
	}
    /*
    frames++;
    printf("FRAME %d\n",frames);
    if (frames==262) {
        FILE *f;
        sleep(1);
        f=fopen("/tmp/video.dmp","wb");
        fwrite(&memory.vid.ram,0x20000,1,f);
        fclose(f);
    }
    */
	return 1;
}

static inline void update_screen(void) {

	if (memory.vid.irq2control & 0x40)
		memory.vid.irq2start = (memory.vid.irq2pos + 3) / 0x180; /* ridhero gives 0x17d */
	else
		memory.vid.irq2start = 1000;

	if (!skip_this_frame) {
		if (last_line < 21) { /* there was no IRQ2 while the beam was in the
							 * visible area -> no need for scanline rendering */
			draw_screen();
		} else {
			draw_screen_scanline(last_line - 21, 262, 1);
		}
	}

	last_line = 0;

	pd4990a_addretrace();
	if (fc >= neogeo_frame_counter_speed) {
		fc = 0;
		neogeo_frame_counter++;
	}
	fc++;

	skip_this_frame = skip_next_frame;
	skip_next_frame = frame_skip(0);
}

static inline int update_scanline(void) {
	memory.vid.irq2taken = 0;

	if (memory.vid.irq2control & 0x10) {

		if (current_line == memory.vid.irq2start) {
			if (memory.vid.irq2control & 0x80)
				memory.vid.irq2start += (memory.vid.irq2pos + 3) / 0x180;
			memory.vid.irq2taken = 1;
		}
	}

	if (memory.vid.irq2taken) {
		if (!skip_this_frame) {
			if (last_line < 21)
				last_line = 21;
			if (current_line < 20)
				current_line = 20;
			draw_screen_scanline(last_line - 21, current_line - 20, 0);
		}
		last_line = current_line;
	}
	current_line++;
	return memory.vid.irq2taken;
}

int slow_motion = 0;

	int neo_emu_done;
	int m68k_overclk;
	int z80_overclk;
	//int nb_frames = 0;
	int a,i;

	SDL_Rect buf_rect = { 24, 16, 304, 224 };
	SDL_Rect screen_rect = { 0, 0, 304, 224 };

	Uint32 cpu_68k_timeslice;
	Uint32 cpu_68k_timeslice_scanline;
	Uint32 cpu_z80_timeslice;
	Uint32 tm_cycle;

	Uint32 cpu_z80_timeslice_interlace;

void one_loop(void) {
		if (conf.test_switch == 1)
			conf.test_switch = 0;

		//neo_emu_done=
		if (handle_event()) {
			int interp = interpolation;
			SDL_BlitSurface(buffer, &buf_rect, state_img, &screen_rect);
			interpolation = 0;
			if (run_menu() == 2) {
				neo_emu_done = 1;/*printf("Unlock audio\n");SDL_UnlockAudio()*/
				return;
			} // A bit ugly...
			//neo_emu_done = 1;
			interpolation = interp;
			reset_frame_skip();
			reset_event();
		}

		if (slow_motion)
			SDL_Delay(100);

		if (!conf.debug) {
			if (conf.raster) {
				current_line = 0;
				for (i = 0; i < 264; i++) {
					tm_cycle = cpu_68k_run(cpu_68k_timeslice_scanline
							- tm_cycle);
					if (update_scanline())
						cpu_68k_interrupt(2);
				}
				tm_cycle = cpu_68k_run(cpu_68k_timeslice_scanline - tm_cycle);
				//state_handling(pending_save_state, pending_load_state);

				update_screen();
				memory.watchdog++;
				if (memory.watchdog > 7) {
                    printf("WATCHDOG RESET\n");
					cpu_68k_reset();
                }
				cpu_68k_interrupt(1);
			} else {
				PROFILER_START(PROF_68K);
				tm_cycle = cpu_68k_run(cpu_68k_timeslice - tm_cycle);
				PROFILER_STOP(PROF_68K);
				a = neo_interrupt();

				/* state handling (we save/load before interrupt) */
				//state_handling(pending_save_state, pending_load_state);

				memory.watchdog++;

				if (memory.watchdog > 7) { /* Watchdog reset after ~0.13 == ~7.8 frames */
                    printf("WATCHDOG RESET %d\n",memory.watchdog);
					cpu_68k_reset();
                }

				if (a) {
					cpu_68k_interrupt(a);
				}
			}
		} else {
			/* we are in debug mode -> we are just here for event handling */
			neo_emu_done = 1;
		}

#ifdef ENABLE_PROFILER
		profiler_show_stat();
#endif
		PROFILER_START(PROF_ALL);
}

void main_loop(void) {
	neo_emu_done = 0;
	m68k_overclk = CF_VAL(cf_get_item_by_name("68kclock"));
	z80_overclk = CF_VAL(cf_get_item_by_name("z80clock"));
	//int nb_frames = 0;

	/* buf_rect = { 24, 16, 304, 224 }; */
	/* screen_rect = { 0, 0, 304, 224 }; */
	cpu_68k_timeslice = (m68k_overclk == 0 ? 200000 : 200000
			+ (m68k_overclk * 200000 / 100.0));
	cpu_68k_timeslice_scanline = cpu_68k_timeslice / 264.0;
	cpu_z80_timeslice = (z80_overclk == 0 ? 73333 : 73333 + (z80_overclk
			* 73333 / 100.0));
	tm_cycle = 0;

	cpu_z80_timeslice_interlace = cpu_z80_timeslice
			/ (float) nb_interlace;

	reset_frame_skip();
	my_timer();

	//pause_audio(0);
#ifdef __EMSCRIPTEN__
    emscripten_set_main_loop(one_loop, 0, 1);
#else
	while (!neo_emu_done) {
        one_loop();
	}
#endif

	pause_audio(1);
#ifdef ENABLE_940T
	wait_busy_940(JOB940_RUN_Z80);
	wait_busy_940(JOB940_RUN_Z80_NMI);
	shared_ctl->z80_run = 0;
#endif

}

void cpu_68k_dpg_step(void) {
	static Uint32 nb_cycle;
	static Uint32 line_cycle;
	Uint32 cpu_68k_timeslice = 200000;
	Uint32 cpu_68k_timeslice_scanline = 200000 / (float) 262;
	Uint32 cycle;
	if (nb_cycle == 0) {
		main_loop(); /* update event etc. */
	}
	cycle = cpu_68k_run_step();
	add_bt(cpu_68k_getpc());
	line_cycle += cycle;
	nb_cycle += cycle;
	if (nb_cycle >= cpu_68k_timeslice) {
		nb_cycle = line_cycle = 0;
		if (conf.raster) {
			update_screen();
		} else {
			neo_interrupt();
		}
		//state_handling(pending_save_state, pending_load_state);
		cpu_68k_interrupt(1);
	} else {
		if (line_cycle >= cpu_68k_timeslice_scanline) {
			line_cycle = 0;
			if (conf.raster) {
				if (update_scanline())
					cpu_68k_interrupt(2);
			}
		}
	}
}

void debug_loop(void) {
	int a;
	do {
	  a = cpu_68k_debuger(cpu_68k_dpg_step, /*dump_hardware_reg*/NULL);
	} while (a != -1);
}
