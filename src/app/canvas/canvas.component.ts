import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

interface imagesData {
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  name?: string
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild('canvasElement', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLElement>;
  context!: CanvasRenderingContext2D | any;
  images: imagesData[] = [];
  draggingImageIndex: number = -1;
  offsetX!: number;
  offsetY!: number;
  isResizing: boolean = false;
  resizingImageIndex: number = -1;

  constructor() { }

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.canvas.nativeElement.addEventListener('mousedown', this.mouse_down.bind(this));
    this.canvas.nativeElement.addEventListener('mouseup', this.mouse_up.bind(this));
    this.canvas.nativeElement.addEventListener('mousemove', this.mouse_move.bind(this));

    let canvasContainerWidth = this.canvasContainer.nativeElement.offsetWidth
    let canvasContainerheight = this.canvasContainer.nativeElement.clientHeight

    this.canvas.nativeElement.width = canvasContainerWidth - 200;
    this.canvas.nativeElement.height = canvasContainerheight - 100;
  }

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          const canvasWidth = this.canvas.nativeElement.width;
          const canvasHeight = this.canvas.nativeElement.height;
          const maxWidth = canvasWidth * 0.5;
          const maxHeight = canvasHeight * 0.5;

          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }
          let fileNameWithoutExtension = file.name.split('.').slice(0, -1).join('.');
          this.images.push({ img, x: 0, y: 0, width, height, name: fileNameWithoutExtension });
          this.drawImages();
        };

        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  drawImages() {
    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    for (const image of this.images) {
      this.context.drawImage(image.img, image.x, image.y, image.width, image.height);
      const handleSize = 10;
      const handleX = image.x + image.width - handleSize;
      const handleY = image.y + image.height - handleSize;
      this.context.fillStyle = 'red';
      this.context.fillRect(handleX, handleY, handleSize, handleSize);
    }
  }

  mouse_down(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i];
      const handleSize = 10;
      const handleX = image.x + image.width - handleSize;
      const handleY = image.y + image.height - handleSize;

      if (x > handleX && x < handleX + handleSize && y > handleY && y < handleY + handleSize) {
        this.isResizing = true;
        this.resizingImageIndex = i;
        return;
      }
    }

    this.draggingImageIndex = this.images.findIndex(
      image => x > image.x && x < image.x + image.width && y > image.y && y < image.y + image.height
    );

    if (this.draggingImageIndex !== -1) {
      const image = this.images[this.draggingImageIndex];
      this.offsetX = x - image.x;
      this.offsetY = y - image.y;
    }
  }

  mouse_up() {
    this.draggingImageIndex = -1;
    this.isResizing = false;
    this.resizingImageIndex = -1;
  }

  mouse_move(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isResizing && this.resizingImageIndex !== -1) {
      const image = this.images[this.resizingImageIndex];

      const newWidth = x - image.x;
      const newHeight = y - image.y;

      image.width = Math.max(newWidth, 10);
      image.height = Math.max(newHeight, 10);

      this.drawImages();
    } else if (this.draggingImageIndex !== -1) {
      const image = this.images[this.draggingImageIndex];
      image.x = x - this.offsetX;
      image.y = y - this.offsetY;

      this.drawImages();
    }
  }

}
