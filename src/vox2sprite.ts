#!/usr/bin/env node

import { MagicaVoxel } from './magicavoxel';

const files = [
  '7-7-7.vox',
  '7-7-8.vox',
  '7-8-7.vox',
  '7-8-8.vox',
  '8-7-7.vox',
  '8-7-8.vox',
  '8-8-7.vox',
  '8-8-8.vox',
  'christmas_scene.vox',
  'chr_knight.vox',
  'chr_old.vox',
  'chr_rain.vox',
  'chr_sword.vox',
  'horse.vox',
  'menger.vox',
  'monu0.vox',
  'monu10.vox',
  'monu16.vox',
  'monu1.vox',
  'monu2.vox',
  'monu3.vox',
  'monu4.vox',
  'monu5.vox',
  'monu6.vox',
  'monu6-without-water.vox',
  'monu7.vox',
  'monu8.vox',
  'monu8-without-water.vox',
  'monu9.vox',
  'red_booth_solid.vox',
  'street_scene.vox',
  'tiletest.vox',
  'treehouse.vox',
];

for (const fileName of files) {
  new MagicaVoxel(`./vox/${fileName}`).renderTo(`./out/${fileName}.png`);
}
