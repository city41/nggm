/*
 * unzip.h
 * Basic unzip interface
 *
 *  Created on: 1 janv. 2010
 *      Author: Mathieu Peponas
 */

#ifndef UNZIP_H_
#define UNZIP_H_

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "stb_zlib.h"

#include <stdio.h>
#include <stdint.h>

typedef struct ZFILE {
	//char *name;
	int pos;
	zbuf *zb;
	FILE *f;
	int csize,uncsize;
	int cmeth; /* compression method */
	int readed;
}ZFILE;

typedef struct PKZIP {
	FILE *file;
	unsigned int cd_offset; /* Central dir offset */
	unsigned int cd_size;
	unsigned int cde_offset;
	uint16_t nb_item;
	uint8_t *map;
}PKZIP;

void gn_unzip_fclose(ZFILE *z);
int gn_unzip_fread(ZFILE *z,uint8_t *data,unsigned int size);
ZFILE *gn_unzip_fopen(PKZIP *zf,const char *filename,uint32_t file_crc);
PKZIP *gn_open_zip(char *file);
uint8_t *gn_unzip_file_malloc(PKZIP *zf,const char *filename,uint32_t file_crc,unsigned int *outlen);
void gn_close_zip(PKZIP *zf);

#endif /* UNZIP_H_ */
