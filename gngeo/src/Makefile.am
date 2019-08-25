AM_CPPFLAGS = -DDATA_DIRECTORY=\"$(pkgdatadir)\"

SUBDIRS = effect blitter $(m68k_subdir) 

bin_PROGRAMS = gngeo
gngeo_SOURCES = pd4990a.c gngeo_icon.h sound.h video.c profiler.c \
                main.c pd4990a.h video.h list.c memory.c profiler.h \
                list.h blitter.h font.h memory.h resfile.c timer.c \
                effect.h frame_skip.c messages.c screen.c timer.h \
                emu.c frame_skip.h messages.h screen.h unzip.h emu.h \
                neocrypt.c sound.c unzip.c resfile.h debug.c debug.h \
                neocrypt.h state.c state.h video_template.h conf.c \
                conf.h transpack.h transpack.c gnutil.c gnutil.h \
                menu.c menu.h roms.h roms.c mame_layer.h mame_layer.c \
                neoboot.c event.h event.c stb_image.c stb_image.h \
                stb_zlib.c stb_zlib.h generator68k_interf.c 

m68k_subdir = generator68k
m68k_lib = generator68k/libgenerator68k.a

gngeo_LDADD = effect/libeffect.a blitter/libblitter.a \
                $(m68k_lib) $(asm_lib)

EXTRA_DIST = c32.mac screen_i386.asm video_i386.asm video_i386.inc \
             getopt.h

video_i386.o : video_i386.inc
video_i386.o screen_i386.o : %.o: %.asm
	nasm -f elf -I $(srcdir)/ $< -o $@
