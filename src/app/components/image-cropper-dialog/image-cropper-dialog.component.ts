import { Component, Inject, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { base64ToFile, Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';


@Component({
    selector: 'image-cropper-dialog',
    templateUrl: './image-cropper-dialog.html',
    styleUrls: ['./image-cropper-dialog.component.css']
})
export class ImageCropperDialog {
    imageChangedEvent: any = null;
    cropperMinWidth = 368;
    resizeToWidth = 368;
    canvasRotation = 0;
    rotation?: number;
    translateH = 0;
    translateV = 0;
    scale = 1;
    aspectRatio = 9 / 5;
    showCropper = false;
    containWithinAspectRatio = false;
    transform: ImageTransform = {
        translateUnit: 'px'
    };
    imageURL?: string;
    loading = false;
    allowMoveImage = false;
    hidden = false;
    autocrop = false;

    croppedImage: any = {};
    exportableImage: any = {};
    resultatot = {};
    thumbReady = false;
    imageBase64 = '';
    @ViewChild('uno') imageCropper!: ImageCropperComponent;
    @ViewChild('dos') pesho!: ImageCropperComponent;
    constructor(
        public dialogRef: MatDialogRef<ImageCropperDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { 
            console.log('Data: ', data);
        }

        cropFullSize(): void {
            this.croppedImage['imgFullSize'] = this.imageCropper.crop()?.base64;
            this.exportableImage['imgFullSize'] = base64ToFile(this.croppedImage['imgFullSize']);
        }

        cropThumb(): void{
            this.croppedImage['thumb'] = this.pesho.crop()?.base64;
            this.exportableImage['thumb'] = base64ToFile(this.croppedImage['thumb']);
        }

        cropBoth(): void{
            this.croppedImage['imgFullSize'] = this.imageCropper.crop()?.base64;
            this.exportableImage['imgFullSize'] = base64ToFile(this.croppedImage['imgFullSize']);
            this.croppedImage['thumb'] = this.pesho.crop()?.base64;
            this.exportableImage['thumb'] = base64ToFile(this.croppedImage['thumb']);
        }

        fileChangeEvent(event: any): void {
            this.loading = true;
            this.imageChangedEvent = event;
          }
        
          imageCropped(event: ImageCroppedEvent) {
            //!this.croppedImage = event.base64;
            //!this.exportableImage = base64ToFile(this.croppedImage);
          }
        
          imageLoaded(event: any) {
            this.showCropper = true;
            console.log('Image loaded', event);
            this.imageBase64 = ''+event.original.base64;
            this.thumbReady = true;
          }
        
          cropperReady(sourceImageDimensions: Dimensions) {
            console.log('Cropper ready', sourceImageDimensions);
            this.loading = false;
            this.hidden = false;
          }
        
          loadImageFailed() {
            console.error('Load image failed');
          }
        
          rotateLeft() {
            this.loading = true;
            setTimeout(() => { // Use timeout because rotating image is a heavy operation and will block the ui thread
              this.canvasRotation--;
              this.flipAfterRotate();
            });
          }
        
          rotateRight() {
            this.loading = true;
            setTimeout(() => {
              this.canvasRotation++;
              this.flipAfterRotate();
            });
          }
        
          moveLeft() {
            this.transform = {
              ...this.transform,
              translateH: ++this.translateH
            };
          }
        
          moveRight() {
            this.transform = {
              ...this.transform,
              translateH: --this.translateH
            };
          }
        
          moveTop() {
            this.transform = {
              ...this.transform,
              translateV: ++this.translateV
            };
          }
        
          moveBottom() {
            this.transform = {
              ...this.transform,
              translateV: --this.translateV
            };
          }
        
          private flipAfterRotate() {
            const flippedH = this.transform.flipH;
            const flippedV = this.transform.flipV;
            this.transform = {
              ...this.transform,
              flipH: flippedV,
              flipV: flippedH
            };
            this.translateH = 0;
            this.translateV = 0;
          }
        
          flipHorizontal() {
            this.transform = {
              ...this.transform,
              flipH: !this.transform.flipH
            };
          }
        
          flipVertical() {
            this.transform = {
              ...this.transform,
              flipV: !this.transform.flipV
            };
          }
        
          resetImage() {
            this.scale = 1;
            this.rotation = 0;
            this.canvasRotation = 0;
            this.transform = {
              translateUnit: 'px'
            };
          }
        
          zoomOut() {
            this.scale -= .1;
            this.transform = {
              ...this.transform,
              scale: this.scale
            };
          }
        
          zoomIn() {
            this.scale += .1;
            this.transform = {
              ...this.transform,
              scale: this.scale
            };
          }
        
          toggleContainWithinAspectRatio() {
            this.containWithinAspectRatio = !this.containWithinAspectRatio;
          }
        
          updateRotation() {
            this.transform = {
              ...this.transform,
              rotate: this.rotation
            };
          }
        
          toggleAspectRatio() {
            this.aspectRatio = this.aspectRatio === 4 / 3 ? 16 / 5 : 4 / 3;
          }

}