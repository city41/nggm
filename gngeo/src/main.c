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

#include <signal.h>

#include "SDL.h"
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "video.h"
#include "screen.h"
#include "emu.h"
#include "sound.h"
#include "messages.h"
#include "memory.h"
#include "debug.h"
#include "blitter.h"
#include "effect.h"
#include "conf.h"
#include "transpack.h"
#include "event.h"
#include "menu.h"
#include "frame_skip.h"
#include "gnutil.h"
#include "roms.h"

static void catch_me(int signo) {
	printf("Catch a sigsegv\n");
	//SDL_Quit();
	exit(-1);
}


int run_rom(int argc, char *argv[])
{
    char *rom_name;
    int rc;


	signal(SIGSEGV, catch_me);

    cf_init(); /* must be the first thing to do */
    cf_init_cmd_line();
    cf_open_file(NULL); /* Open Default configuration file */

    rom_name=cf_parse_cmd_line(argc,argv);

    /* print effect/blitter list if asked by user */
    if (!strcmp(CF_STR(cf_get_item_by_name("effect")),"help")) {
	print_effect_list();
	exit(0);
    }
    if (!strcmp(CF_STR(cf_get_item_by_name("blitter")),"help")) {
	print_blitter_list();
	exit(0);
    }

	init_sdl();

	init_event();

    if ((rc=gn_init_skin())!=GN_TRUE) {
	    printf("Can't load skin...\n");
            exit(1);
    }    

	reset_frame_skip();


/* Launch the specified game, or the rom browser if no game was specified*/
	if (!rom_name) {
	//	rom_browser_menu();
		run_menu();
		printf("GAME %s\n",conf.game);
		if (conf.game==NULL) return 0;
	} else {
        printf("rom_name %s\n", rom_name);

		if (init_game(rom_name)!=GN_TRUE) {
			printf("Can't init %s...\n",rom_name);
            exit(1);
		}    
	}

	/* If asked, do a .gno dump and exit*/
    if (CF_BOOL(cf_get_item_by_name("dump"))) {
        char dump[8+4+1];
        sprintf(dump,"%s.gno",rom_name);
        dr_save_gno(&memory.rom,dump);
        close_game();
        return 0;
    }

    if (conf.debug)
	    debug_loop();
    else
	    main_loop();

    close_game();


    return 0;
}

int main(int argc, char* argv[]) {
  run_rom(argc, argv);
}
