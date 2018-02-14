import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Broadcaster, Logger, Notification, Notifications, NotificationType } from 'ngx-base';
import { Context, SpaceNamePipe, SpaceService } from 'ngx-fabric8-wit';
import { ProcessTemplate } from 'ngx-fabric8-wit';
import { Space, SpaceAttributes } from 'ngx-fabric8-wit';
import { UserService } from 'ngx-login-client';
import { Observable } from 'rxjs';

import { ContextService } from 'app/shared/context.service';
import { DummyService } from 'app/shared/dummy.service';
import { SpaceNamespaceService } from 'app/shared/runtime-console/space-namespace.service';
import { SpacesService } from 'app/shared/spaces.service';

@Component({
  selector: 'imports',
  templateUrl: './imports.component.html',
  styleUrls: ['./imports.component.less']
})
export class ImportsComponent implements OnInit, OnDestroy {

  spaceTemplates: ProcessTemplate[];
  selectedTemplate: ProcessTemplate;
  space: Space;
  currentSpace: Space;

  constructor(
    private router: Router,
    public dummy: DummyService,
    private spaceService: SpaceService,
    private notifications: Notifications,
    private userService: UserService,
    private spaceNamespaceService: SpaceNamespaceService,
    private spaceNamePipe: SpaceNamePipe,
    private spacesService: SpacesService,
    private context: ContextService,
    private broadcaster: Broadcaster
  ) {
    this.spaceTemplates = dummy.processTemplates;

  }

  ngOnDestroy() {

  }

  ngOnInit() {
    const srumTemplates = this.spaceTemplates.filter(template => template.name === 'Scenario Driven Planning');
    if (srumTemplates && srumTemplates.length > 0) {
      this.selectedTemplate = srumTemplates[0];
    }
    this.context.current.subscribe((ctx: Context) => {
      if (ctx.space) {
        this.currentSpace = ctx.space;
        console.log(`ForgeWizardComponent::The current space has been updated to ${this.currentSpace.attributes.name}`);
      }
    });
  }

  hideImports(): void {
    this.broadcaster.broadcast('showImports', false);
  }

}
