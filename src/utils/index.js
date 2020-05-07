import * as THREE from "three";

export const randomInRange = (from, to)  => Math.random() * (to - from) + from;

export const randomInRangeInt = (from, to) => Math.floor(Math.random() * (Math.floor(to) - Math.ceil(from) + 1)) + Math.ceil(from);

export const toRadian = (degrees) => degrees * Math.PI / 180;


export const makeTextSprite = ( message, parameters ) => {
  if ( parameters === undefined ) parameters = {};

  const fontface = parameters.fontface ? parameters.fontface : "Arial";
  const fontsize = parameters.fontsize ? parameters.fontsize : '18';
  const borderThickness = parameters.borderThickness ? parameters.borderThickness : 0;
  const borderColor = parameters.borderColor ? parameters.borderColor : { r: 0, g: 0, b: 0, a: 0 };
  const backgroundColor = parameters.backgroundColor ? parameters.backgroundColor : { r: 255, g: 255, b: 255, a: 1.0 };

  // const spriteAlignment = THREE.SpriteAlignment.topLeft;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;

  // get size data (height depends only on font size)
  const metrics = context.measureText( message );
  const textWidth = metrics.width;

  // background color
  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
    + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
    + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 0);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);

  // canvas contents will be used for a texture
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture } );
  // const spriteMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
  const sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(2,1,1);
  return sprite;
};

// function for drawing rounded rectangles
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

export const drawRay = (pointA, pointB) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([pointA, pointB]);
  const material = new THREE.LineBasicMaterial( { color: 0xaa0000 } );
  return new THREE.Line( geometry, material );
}
