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

#include "SDL.h"

/* progress bar function */
static Uint8 pg_last;
static Uint8 pg_size;
static Uint32 oldpos=0;

void create_progress_bar(const char *desc) {
    int i;
    pg_size=62;//74-strlen(desc);
    pg_last=0;

    printf("%12s [",desc);
    for (i=0;i<pg_size;i++)
	printf("-");
    printf("]\r%12s [",desc);
    fflush(stdout);
}

void update_progress_bar(Uint32 current_pos,Uint32 size) {
    Uint8 pg_current=(pg_size*current_pos)/(double)size;
    int i;

    
    for(i=pg_last;i<pg_current;i++) {
	putchar('*');
    }
    pg_last=pg_current;
    fflush(stdout);
}

void terminate_progress_bar(void) {
    int i;
    for(i=pg_last;i<pg_size;i++) {
	putchar('*');
    }
    printf("\r");
}

