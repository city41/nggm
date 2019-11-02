
#ifdef HAVE_CONFIG_H
#include <config.h>
#endif

#include "SDL.h"
#include "../emu.h"
#include "../screen.h"
#include "../video.h"
#include "../effect.h"
#include "../conf.h"
#include "../gnutil.h"
/*
static SDL_Rect buf_rect	 =	{16, 16, 304, 224};
*/
static SDL_Rect screen_rect =	{ 0,  0, 304, 224};
static int vsync;


int
blitter_soft_init()
{
	Uint32 width = visible_area.w;
	Uint32 height = visible_area.h;

	if (window != NULL) return GN_TRUE;

	//int screen_size=CF_BOOL(cf_get_item_by_name("screen320"));
	Uint32 sdl_flags = 0;

	vsync = CF_BOOL(cf_get_item_by_name("vsync"));

	if (vsync) {
		height=240;
		screen_rect.y = 8;

	} else {
		height=visible_area.h;
		screen_rect.y = 0;
		yscreenpadding=0;
	}

	screen_rect.w=visible_area.w;
	screen_rect.h=visible_area.h;


	if (neffect!=0)	scale =1;
	if (scale == 1) {
	    width *=effect[neffect].x_ratio;
	    height*=effect[neffect].y_ratio;
	} else {
	    if (scale > 3) scale=3;
	    width *=scale;
	    height *=scale;
	}
	
	window = SDL_CreateWindow("Gngeo",
				  SDL_WINDOWPOS_UNDEFINED,
				  SDL_WINDOWPOS_UNDEFINED,
				  width, height,
				  (fullscreen?SDL_WINDOW_FULLSCREEN_DESKTOP:0)|sdl_flags);
	renderer = SDL_CreateRenderer(window, -1, vsync?SDL_RENDERER_PRESENTVSYNC:0);
	// for preserving aspect when scaling
	SDL_RenderSetLogicalSize(renderer, width, height);
	//SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "linear");
	texture = SDL_CreateTexture(renderer,
				    SDL_PIXELFORMAT_RGB565,
				    SDL_TEXTUREACCESS_STREAMING,
				    width, height);
	screen = SDL_CreateRGBSurface(SDL_SWSURFACE, width, height, 16, 0xF800, 0x7E0, 0x1F, 0);
	//SDL_ShowCursor(SDL_DISABLE);

	if (!screen) return GN_FALSE;
	if (vsync) yscreenpadding = screen_rect.y * screen->pitch;

	return GN_TRUE;
}

void 
update_double()
{
	Uint16 *src, *dst;
	Uint32 s, d;
	Uint8 w, h;
	
	src = (Uint16 *)buffer->pixels + visible_area.x + (buffer->w << 4);// LeftBorder + RowLength * UpperBorder

	dst = (Uint16 *)screen->pixels + yscreenpadding;
	
	for(h = visible_area.h; h > 0; h--)
	{
		for(w = visible_area.w>>1; w > 0; w--)
		{		
			s = *(Uint32 *)src;
#ifdef WORDS_BIGENDIAN
			d = (s & 0xFFFF0000) + ((s & 0xFFFF0000)>>16);
			*(Uint32 *)(dst) = d;
			*(Uint32 *)(dst+(visible_area.w<<1)) = d;
				
			d = (s & 0x0000FFFF) + ((s & 0x0000FFFF)<<16);
			*(Uint32 *)(dst+2) = d;
			*(Uint32 *)(dst+(visible_area.w<<1)+2) = d;
#else
			d = (s & 0x0000FFFF) + ((s & 0x0000FFFF) << 16);
			*(Uint32 *)(dst) = d;
			*(Uint32 *) (dst + (visible_area.w << 1)) = d;

			d = (s & 0xFFFF0000) + ((s & 0xFFFF0000)>>16);
			*(Uint32 *)(dst+2) = d;
			*(Uint32 *)(dst+(visible_area.w<<1)+2) = d;
				

#endif			
			dst += 4;
			src += 2;
		}
		//memcpy(dst,dst-(visible_area.w<<1),(visible_area.w<<2));
		src += (visible_area.x<<1);		
		dst += (visible_area.w<<1);
//		dst += (buffer->pitch);
	}
}

void 
update_triple()
{
	Uint16 *src, *dst;
	Uint32 s, d;
	Uint8 w, h;
	
	src = (Uint16 *)buffer->pixels + visible_area.x + (buffer->w << 4);// LeftBorder + RowLength * UpperBorder
	dst = (Uint16 *)screen->pixels + yscreenpadding;
	
	for(h = visible_area.h; h > 0; h--)
	{
		for(w = visible_area.w>>1; w > 0; w--)
		{		
			s = *(Uint32 *)src;
#ifdef WORDS_BIGENDIAN
			d = (s & 0xFFFF0000) + ((s & 0xFFFF0000)>>16);
			*(Uint32 *)(dst) = d;
			*(Uint32 *)(dst+(visible_area.w*3)) = d;
			*(Uint32 *)(dst+(visible_area.w*6)) = d;
				
			*(Uint32 *)(dst+2) = s;
			*(Uint32 *)(dst+(visible_area.w*3)+2) = s;
			*(Uint32 *)(dst+(visible_area.w*6)+2) = s;

			d = (s & 0x0000FFFF) + ((s & 0x0000FFFF)<<16);
			*(Uint32 *)(dst+4) = d;
			*(Uint32 *)(dst+(visible_area.w*3)+4) = d;
			*(Uint32 *)(dst+(visible_area.w*6)+4) = d;

#else				
			d = (s & 0xFFFF0000) + ((s & 0xFFFF0000)>>16);
			*(Uint32 *)(dst+4) = d;
			*(Uint32 *)(dst+(visible_area.w*3)+4) = d;
			*(Uint32 *)(dst+(visible_area.w*6)+4) = d;

			*(Uint32 *)(dst+2) = s;
			*(Uint32 *)(dst+(visible_area.w*3)+2) = s;
			*(Uint32 *)(dst+(visible_area.w*6)+2) = s;

			d = (s & 0x0000FFFF) + ((s & 0x0000FFFF)<<16);
			*(Uint32 *)(dst) = d;
			*(Uint32 *)(dst+(visible_area.w*3)) = d;
			*(Uint32 *)(dst+(visible_area.w*6)) = d;
#endif			
			dst += 6;
			src += 2;
		}
		src += (visible_area.x<<1);		
		dst += (visible_area.w*6);
	}
}

void
blitter_soft_update()
{
		if (neffect == 0) {
			switch (scale) {
				case 2: update_double(); break;
				case 3: update_triple(); break;
				default:
					SDL_BlitSurface(buffer, &visible_area, screen, &screen_rect);
					break;
			}
			
		}

  SDL_UpdateTexture(texture, NULL, screen->pixels, screen->w*2);
  SDL_RenderClear(renderer);
  SDL_RenderCopy(renderer, texture, NULL, NULL);
  SDL_RenderPresent(renderer);
}

void
blitter_soft_close()
{
    
}
	
void
blitter_soft_fullscreen() {
  SDL_SetWindowFullscreen(window,
			  fullscreen?SDL_WINDOW_FULLSCREEN:0);
}
	
