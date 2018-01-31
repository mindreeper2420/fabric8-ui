import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Fabric8WitModule, UniqueSpaceNameValidatorDirective, ValidSpaceNameValidatorDirective } from 'ngx-fabric8-wit';

import { CodebasesService } from '../create/codebases/services/codebases.service';
import { TrustHtmlPipe, TrustStylePipe } from '../wizard/pipes/safe-html.pipe';
import { SelectedItemsPipe } from '../wizard/pipes/selected-items.pipe';
import { VisibleItemsPipe } from '../wizard/pipes/visible-items.pipe';
import { LauncherComponent } from './launcher.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    Fabric8WitModule
  ],
  declarations: [
    LauncherComponent
    // UniqueSpaceNameValidatorDirective,
    // ValidSpaceNameValidatorDirective,
    // SelectedItemsPipe,
    // VisibleItemsPipe,
    // TrustHtmlPipe,
    // TrustStylePipe
  ],
  exports: [
    LauncherComponent
    // UniqueSpaceNameValidatorDirective
  ],
  providers: [
    CodebasesService
  ]
})

export class LauncherModule {

}
