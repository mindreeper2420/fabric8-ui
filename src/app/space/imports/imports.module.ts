import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Fabric8WitModule, UniqueSpaceNameValidatorDirective, ValidSpaceNameValidatorDirective } from 'ngx-fabric8-wit';

import { CodebasesService } from '../create/codebases/services/codebases.service';
import { ImportsComponent } from './imports.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Fabric8WitModule
  ],
  declarations: [
    ImportsComponent
  ],
  exports: [
    ImportsComponent
  ],
  providers: [
    CodebasesService
  ]
})

export class ImportsModule {

}
