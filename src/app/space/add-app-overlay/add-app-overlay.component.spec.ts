import { ErrorHandler } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Broadcaster, Logger, Notifications } from 'ngx-base';
import { PopoverConfig, PopoverModule } from 'ngx-bootstrap/popover';
import { Context, ProcessTemplate, Space, SpaceService } from 'ngx-fabric8-wit';
import { DependencyCheckService } from 'ngx-launcher';
import { Profile, User, UserService } from 'ngx-login-client';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { filter, map } from 'rxjs/operators';

import { ContextService } from '../../shared/context.service';
import { SpaceNamespaceService } from '../../shared/runtime-console/space-namespace.service';
import { SpaceTemplateService } from '../../shared/space-template.service';
import { SpacesService } from '../../shared/spaces.service';
import { DeploymentApiService } from '../create/deployments/services/deployment-api.service';
import { AddAppOverlayComponent } from './add-app-overlay.component';

export class BroadcasterTestProvider {
  private _eventBus: Subject<any>;
  constructor() {
    this._eventBus = new Subject<any>();
  }
  broadcast(key: any, data?: any) {
    this._eventBus.next({key, data});
  }
  on<T>(key: any): Observable<T> {
    return this._eventBus.asObservable()
      .pipe(filter(event => event.key === key),
            map(event => <T> event.data)
      );
  }
}

describe('AddAppOverlayComponent', () => {
  let component: AddAppOverlayComponent;
  let fixture: ComponentFixture<AddAppOverlayComponent>;

  let mockRouter: any = jasmine.createSpyObj('Router', ['navigate']);
  let mockSpaceTemplateService: any = {
    getSpaceTemplates: () => {
      return Observable.of(mockSpaceTemplates);
    }
  };
  let mockSpaceService: any = jasmine.createSpyObj('SpaceService', ['create']);
  let mockNotifications: any = jasmine.createSpyObj('Notifications', ['message']);
  let mockUserService: any = jasmine.createSpyObj('UserService', ['getUser']);
  let mockSpaceNamespaceService: any = jasmine.createSpy('SpaceNamespaceService');
  let mockSpacesService: any = jasmine.createSpy('SpacesService');
  let mockLogger: any = jasmine.createSpyObj('Logger', ['error']);
  let mockErrorHandler: any = jasmine.createSpyObj('ErrorHandler', ['handleError']);
  let mockDependencyCheckService: any = {
    getDependencyCheck(): Observable<any> {
      return Observable.of({
        mavenArtifact: 'd4-345',
        groupId: 'io.openshift.booster',
        projectName: 'app-test-1',
        projectVersion: '1.0.0-SNAPSHOT',
        spacePath: '/myspace'
      });
    },
    validateProjectName(projectName: string): boolean {
      // allows only '-', '_', ' ' and 4-40 characters (must start and end with alphanumeric)
      const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-_\s]{2,38}[a-zA-Z0-9]$/;
      return pattern.test(projectName);
    }
  };
  let mockDeploymentApiService: any = jasmine.createSpyObj('DeploymentApiService', ['getApplications']);
  mockDeploymentApiService.getApplications.and.returnValue(
    Observable.of([{
      attributes: { name: 'app-apr-10-2018-4-25' }
    }, {
      attributes: { name: 'app-may-11-2018' }
    }, {
      attributes: { name: 'app-may-14-1-04' }
    }])
  );

  let mockApplications: string[] = ['app-apr-10-2018-4-25', 'app-may-11-2018', 'app-may-14-1-04'];

  let mockContext: any;

  let mockProfile: Profile = {
    fullName: 'mock-fullName',
    imageURL: 'mock-imageURL',
    username: 'mock-username'
  };

  let mockUser: User = {
    id: 'mock-id',
    attributes: mockProfile,
    type: 'mock-type'
  };

  let mockSpace: Space = {
    name: 'mock-space',
    path: 'mock-path',
    teams: [
      { name: 'mock-name', members: [mockUser] }
    ],
    defaultTeam: { name: 'mock-name', members: [mockUser] },
    id: 'mock-id',
    attributes: {
      name: 'mock-attribute',
      description: 'mock-description',
      'updated-at': 'mock-updated-at',
      'created-at': 'mock-created-at',
      version: 0
    },
    type: 'mock-type',
    links: {
      self: 'mock-self'
    },
    relationships: {
      areas: { links: { related: 'mock-related' } },
      iterations: { links: { related: 'mock-related' } },
      workitemtypegroups: { links: { related: 'mock-related' } },
      'owned-by': {
        data: {
          id: mockUser.id,
          type: mockUser.type
        }
      }
    },
    relationalData: {
      creator: mockUser
    }
  };

  let mockSpaceTemplates: ProcessTemplate[] = [{
    attributes: {
      'can-construct': false,
      description: 'Description-1',
      name: 'Template - 01'
    },
    id: 'template-01',
    type: 'spacetemplates'
  }, {
    attributes: {
      'can-construct': true,
      description: 'Description-2',
      name: 'Template - 02'
    },
    id: 'template-02',
    type: 'spacetemplates'
  }, {
    attributes: {
      'can-construct': true,
      description: 'Description-3',
      name: 'Template - 03'
    },
    id: 'template-03',
    type: 'spacetemplates'
  }] as ProcessTemplate[];

  class mockContextService {
    get current(): Observable<Context> { return Observable.of(mockContext); }
  }

  beforeEach(() => {
    mockContext = {
      name: 'my-space-apr24-4-43',
      path: '/user/my-space-apr24-4-43',
      space: {
        id: 'c814a58b-6220-4670-80cf-a2196899a59d',
        attributes: {
          'created-at': '2018-04-24T11:15:59.164872Z',
          'description': '',
          'name': 'my-space-apr24-4-43',
          'updated-at': '2018-04-24T11:15:59.164872Z',
          'version': 0
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PopoverModule.forRoot()
      ],
      declarations: [
        AddAppOverlayComponent
      ],
      providers: [
        { provide: DeploymentApiService, useValue: mockDeploymentApiService },
        { provide: DependencyCheckService, useValue: mockDependencyCheckService },
        PopoverConfig,
        { provide: Broadcaster, useValue: new BroadcasterTestProvider() },
        { provide: Router, useValue: mockRouter },
        { provide: SpaceTemplateService, useValue: mockSpaceTemplateService },
        { provide: SpaceService, useValue: mockSpaceService },
        { provide: Notifications, useValue: mockNotifications },
        { provide: UserService, useValue: mockUserService },
        { provide: SpaceNamespaceService, useValue: mockSpaceNamespaceService },
        { provide: SpacesService, useValue: mockSpacesService },
        { provide: ContextService, useClass: mockContextService },
        { provide: Logger, useValue: mockLogger },
        { provide: ErrorHandler, useValue: mockErrorHandler }
      ]
    });
  });

  describe('#constructor', () => {
    it('should not have applications if the current space is not defined', () => {
      mockContext.space = null;
      fixture = TestBed.createComponent(AddAppOverlayComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(mockDeploymentApiService.getApplications).toHaveBeenCalledTimes(0);
      expect(component.applications).toEqual([]);
    });

    it('should retieve applications if the current space is defined', () => {
      mockContext.space.id = 'mock-space-id';
      fixture = TestBed.createComponent(AddAppOverlayComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(mockDeploymentApiService.getApplications).toHaveBeenCalledTimes(1);
      expect(mockDeploymentApiService.getApplications).toHaveBeenCalledWith('mock-space-id');
      expect(component.applications).toEqual(mockApplications);
    });
  });

  describe('component', () => {
    let element: HTMLElement;
    let btnElem;
    beforeEach(() => {
      fixture = TestBed.createComponent(AddAppOverlayComponent);
      component = fixture.componentInstance;
      element = fixture.debugElement.nativeElement;
      btnElem = element.querySelector('.code-imports--step_toolbar > button');
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('continue button is disabled on load', () => {
      expect(btnElem.hasAttribute('disabled')).toBeTruthy();
    });

    it('application is not available', () => {
      component.projectName = 'app-may-11-2018';
      component.validateProjectName();
      expect(component.isProjectNameAvailable).toBeFalsy();
    });

    it('application is available', () => {
      component.projectName = 'app-may-11-2018-1';
      component.validateProjectName();
      expect(component.isProjectNameAvailable).toBeTruthy();
    });

    it('application is not valid', () => {
      component.projectName = '#app-may-11-2018-1';
      component.validateProjectName();
      expect(component.isProjectNameValid).toBeFalsy();
    });

    it('application is valid', () => {
      component.projectName = 'app-may-11-2018-1';
      component.validateProjectName();
      expect(component.isProjectNameValid).toBeTruthy();
    });

    it('validate Project Name to be truthy', () => {
      let valProjectName = component.isValidProjectName('app-apr_10');
      expect(valProjectName).toBeTruthy();
    });

    it('validate Project Name to be falsy', () => {
      let valProjectName = component.isValidProjectName('#app-test-1');
      expect(valProjectName).toBeFalsy();
    });

    it('validate Project Name to be falsy as length is not satisfied', () => {
      let valProjectName = component.isValidProjectName('ap');
      expect(valProjectName).toBeFalsy();
    });

    it('validate Project Name to be falsy as length is not satisfied', () => {
      let valProjectName = component.isValidProjectName('12345678901234567890123456789012345678901');
      expect(valProjectName).toBeFalsy();
    });

    it('validate Project Name to be truthy as length is satisfied', () => {
      let valProjectName = component.isValidProjectName('a123456789012345678901234567890123456789');
      expect(valProjectName).toBeTruthy();
    });

    it('should return false if the project name has continous hyphens (-)', () => {
      let valProjectName = component.isValidProjectName('app_name--name');
      expect(valProjectName).toBeFalsy();
    });

    it('should return false if the project name has continous underscores (_)', () => {
      let valProjectName = component.isValidProjectName('app_name__name');
      expect(valProjectName).toBeFalsy();
    });

    it('should not allow project name with spaces', () => {
      let valProjectName = component.isValidProjectName('app_name name');
      expect(valProjectName).toBeFalsy();
    });

    it('should not allow project name starting with a number', () => {
      let valProjectName = component.isValidProjectName('1app_namename');
      expect(valProjectName).toBeFalsy();
    });

    it('should broadcast a event on overlay hide', () => {
      component.hideAddAppOverlay();
      component.broadcaster.on('analyticsTracker')
      .subscribe(data => {
        expect(data['event']).toBe('add app closed');
      });
    });

    it('continue button should be disabled on navigation in progress', async(() => {
      expect(btnElem.hasAttribute('disabled')).toBeTruthy();
      component.navigationInProgress = false;
      component.projectName = 'project-aug-16-2018';
      component.selectedFlow = 'createapp';
      component.validateProjectName();
      component.navigationInProgress = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(btnElem.hasAttribute('disabled')).toBeTruthy();
      });
    }));

    it('continue button should be enable on navigation is not in progress', async(() => {
      expect(btnElem.hasAttribute('disabled')).toBeTruthy();
      component.navigationInProgress = false;
      component.projectName = 'project-aug-16-2018-1';
      component.selectedFlow = 'createapp';
      component.validateProjectName();
      component.isProjectNameAvailable = true;
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(btnElem.hasAttribute('disabled')).toBeFalsy();
      });
    }));
  });

});
