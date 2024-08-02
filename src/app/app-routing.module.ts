import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateComponent } from './template/template.component';
import { CanvasComponent } from './canvas/canvas.component';

const routes: Routes = [
  {
    path : "",
    component : TemplateComponent
  },
  {
    path : "canvas",
    component : CanvasComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
