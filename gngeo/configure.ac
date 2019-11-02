# Process this file with autoconf to produce a configure script.

AC_INIT([gngeo],[0.8])
AC_CONFIG_SRCDIR([src/emu.c])
AC_CANONICAL_TARGET
AC_CONFIG_HEADERS([config.h])


AM_INIT_AUTOMAKE(silent-rules)
AM_SILENT_RULES

# it's not optimal, but at least, it work
if test -z "$CC_FOR_BUILD"; then
  CC_FOR_BUILD=gcc
fi
AC_SUBST(CC_FOR_BUILD)


# Checks for programs.
AC_PROG_CC
AM_PROG_AR
AC_PROG_RANLIB
AM_PROG_AS

# Check whether CC is clang
AC_CACHE_CHECK([whether the C compiler is clang],[ng_cv_cc_clang],
               [if $CC -dM -E - </dev/null 2>/dev/null | grep -q __clang__; then
	         ng_cv_cc_clang=yes;
                else
	         ng_cv_cc_clang=no;
	       fi])

AC_DEFUN([GN_ARG_ENABLE],[
	AC_ARG_ENABLE($1,[  $2],
		[case "${enableval}" in
       	 yes) enable_$1=true ;;
       	 no)  enable_$1=false ;;
       	 *) AC_MSG_ERROR([bad value ${enableval} for --enable-$1]) ;;
     	 esac];$3,
     	 [enable_$1=false];$4)
]
)

GN_ARG_ENABLE(embedded,[--enable-embedded       Enable Embedded directory structure])


# Check for SDL
SDL_VERSION=2.0.0
AM_PATH_SDL2($SDL_VERSION,,AC_MSG_ERROR([*** SDL version $SDL_VERSION not found!]))
CFLAGS="$CFLAGS $SDL_CFLAGS"
LIBS="$LIBS $SDL_LIBS"

# Setup platform specific optimisation/source/cflags/libs/etc.
if test "x$enable_embedded" = xtrue ; then
   AC_DEFINE([EMBEDDED_FS],[1],[Define for embedded directory structure])
fi

# CFLAGS="$CFLAGS -DDATA_DIRECTORY=\"${pkgdatadir}\""

# Checks for libraries.
#AC_SUBST(LIBOBJS)
AC_CHECK_LIB([m], [acos])
AC_CHECK_LIB([z], [inflate])

AC_CHECK_FUNCS(getopt_long , , [ AC_LIBOBJ(getopt) AC_LIBOBJ(getopt1) ])
AC_CHECK_FUNCS(scandir)
AC_CHECK_FUNCS(basename)
AC_CHECK_FUNCS(mmap)
have_nasm=false


AM_CONDITIONAL(HAVE_NASM,[test x$have_nasm = xtrue])

# Checks for header files.
AC_HEADER_DIRENT
AC_HEADER_STDC
AC_CHECK_HEADERS([errno.h limits.h malloc.h stddef.h stdlib.h string.h sys/time.h unistd.h libgen.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_C_CONST
AC_C_INLINE
AC_HEADER_TIME
AC_STRUCT_TM
AC_C_BIGENDIAN

# Checks for library functions.
AC_FUNC_VPRINTF
AC_CHECK_FUNCS([atexit floor gettimeofday memset mkdir pow strchr strstr strtoul])


# Check for processor.
  case $target_cpu in
    i?86)  AC_MSG_RESULT(Turning on x86 processor optimisations)
           AC_DEFINE(PROCESSOR_INTEL, 1, [Define if you have an x86 processor])
           ALIGNLONGS=0
	   proc_i386=true
		CFLAGS="$CFLAGS -O3 -fstrength-reduce -frerun-loop-opt -Wall -Wno-unused -funroll-loops \
                    -ffast-math -falign-functions=2 -falign-jumps=2 -fexpensive-optimizations \
                    -falign-loops=2 -fschedule-insns2 -malign-double -fomit-frame-pointer -g \
		    -fno-strict-aliasing -pipe -mtune=$target_cpu -DCPU=$target_cpu"
           ;;
     x86_64)
	   AC_MSG_RESULT(Turning on x86_64 processor optimisations)
           AC_DEFINE(PROCESSOR_ADM64, 1, [Define if you have an x86_64 processor])
           ALIGNLONGS=0
	   proc_x64=true
		CFLAGS="$CFLAGS -O3 -fstrength-reduce -frerun-loop-opt -Wall -Wno-unused -funroll-loops \
                    -ffast-math  -fexpensive-optimizations \
                     -malign-double -fomit-frame-pointer -g \
		    -fno-strict-aliasing -pipe -DCPU=$target_cpu"
           ;;
    sparc*) AC_MSG_RESULT(Turning on sparc processor optimisations)
           AC_DEFINE(PROCESSOR_SPARC, 1, [Define if you have a sparc processor])
	   ALIGNLONGS=1
	   proc_sparc=true
	   if test $target_cpu = sparc64 && test $CC_MAJOR -ge 3 ; then
		CFLAGS="$CFLAGS -mcpu=v9"
	   fi
	   CFLAGS="$CFLAGS -O3 -Wall -Wno-unused -funroll-loops \
                    -ffast-math -fomit-frame-pointer -g"
           ;;
    *)     AC_MSG_RESULT(Processor type unknown - Use generic optimisations)
           ALIGNLONGS=1
           optimum=no
	   CFLAGS="$CFLAGS -O3 -Wall -Wno-unused -funroll-loops \
                    -ffast-math -g"
           ;;
  esac

# doing this always since emscripten uses clang
# if test "x$ng_cv_cc_clang" = "xyes"; then
   CFLAGS=`echo $CFLAGS | sed -e 's/-fexpensive-optimizations//g' -e 's/-frerun-loop-opt//g' -e 's/-fstrength-reduce//' -e 's/-malign-double//g'`
# fi

AM_CONDITIONAL(PROCESSOR_ARM,[test x$proc_arm = xtrue])
  
AC_DEFINE(ALIGNLONGS, ALIGNLONGS,
            [Undefine if your processor can read unaligned 32-bit values])

# needed, so def68k can find it in out-of-source builds
AC_CONFIG_LINKS([src/generator68k/def68k.def:src/generator68k/def68k.def])

AC_CONFIG_FILES([Makefile
                 gngeo.dat/Makefile
                 pnd/Makefile
                 src/Makefile
                 src/generator68k/Makefile
                 src/effect/Makefile
                 src/blitter/Makefile])
AC_OUTPUT
