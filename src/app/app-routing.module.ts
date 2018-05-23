import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureFlagResolver } from './feature-flag/resolver/feature-flag.resolver';

import { trimEnd } from 'lodash';

import { LoginComponent } from './login/login.component';
import { ContextResolver } from './shared/context-resolver.service';
import { ProfileResolver } from './shared/profile-resolver.service';
import { SigninComponent } from './signin/signin.component';


export function removeAction(url: string) {
  const nestedOutletRegex: RegExp = (/^(.*\([A-z-]*?)\/{0,2}action:[A-z-]*\)$/);
  if (url.indexOf('action:') !== -1) {
    if (nestedOutletRegex.test(url)) {
      // if the action outlet contains the current page
      // e.g., /${user}/${space}/create/(pipelines//action:add-codebase)
      url = url.match(nestedOutletRegex)[1];
      let i = url.lastIndexOf('(');
      url = url.substring(0, i) + url.substring(i + 1);
      if ((url.lastIndexOf('/') + 1) === url.length) {
       url = url.slice(0, -1); // trim trailing '/' if applicable
      }
    } else {
      // if the outlet is isolated at the end of the url
      // e.g., /${user}/${space}/create/(action:add-codebase)
      url = trimEnd(url.replace(/\(action:[a-z-]*\)/, ''), '/');
    }
  }
  return url;
}

export const routes: Routes = [

  // Only relevant locally, as the landing page sits on / in production
  {
    path: '',
    loadChildren: './landing-page/landing-page.module#LandingPageModule',
    pathMatch: 'full'
  },

  // Home
  {
    path: '_home',
    resolve: {
      featureFlagConfig: FeatureFlagResolver
    },
    loadChildren: './home/home.module#HomeModule',
    data: {
      title: 'Home',
      featureName: 'Analyze'
    }
  },

  // Getting started
  {
    path: '_gettingstarted',
    loadChildren: './getting-started/getting-started.module#GettingStartedModule',
    data: {
      title: 'Getting Started'
    }
  },
  //verify Email
  {
    path: '_verifyEmail',
    loadChildren: './profile/email-verification/email-verification.module#EmailVerificationModule',
    data: {
      title: 'Verify'
    }
  },
  // Error Pages
  {
    path: '_error',
    loadChildren: './layout/error/error.module#ErrorModule',
    data: {
      title: 'Error'
    }
  },
  // Feature Flag
  {
    path: '_featureflag',
    loadChildren: './feature-flag/feature-flag.module#FeatureFlagModule',
    data: {
      title: 'Feature Flag'
    }
  },
  // Profile
  {
    path: '_profile',
    resolve: {
      context: ProfileResolver
    },
    loadChildren: './profile/profile.module#ProfileModule',
    data: {
      title: 'Profile'
    }
  },

  {
    path: ':entity',
    resolve: {
      context: ContextResolver
    },
    loadChildren: './profile/profile.module#ProfileModule',
    data: {
      title: 'Profile'
    }
  },

  // Analyze
  {
    path: ':entity/:space',
    resolve: {
      context: ContextResolver,
      featureFlagConfig: FeatureFlagResolver
    },
    loadChildren: './space/analyze/analyze.module#AnalyzeModule',
    data: {
      title: 'Analyze',
      featureName: 'Analyze'
    }
  },

  // Plan
  {
    path: ':entity/:space/plan',
    resolve: {
      context: ContextResolver,
      featureFlagConfig: FeatureFlagResolver
    },
    loadChildren: './space/plan/plan.module#PlanModule',
    data: {
      title: 'Plan: Backlog',
      featureName: 'Planner'
    }
  },

  // // Plan board
  // {
  //   path: ':entity/:space/plan/board',
  //   resolve: {
  //     context: ContextResolver,
  //     featureFlagConfig: FeatureFlagResolver
  //   },
  //   loadChildren: './space/plan/board/board.module#BoardModule',
  //   data: {
  //     title: 'Plan: Board',
  //     featureName: 'Planner'
  //   }
  // },

  // Plan details
  {
    path: ':entity/:space/plan/detail',
    resolve: {
      context: ContextResolver,
      featureFlagConfig: FeatureFlagResolver
    },
    loadChildren: './space/plan/detail/detail.module#DetailModule',
    data: {
      title: 'Plan: Detail',
      featureName: 'Planner'
    }
  },

  // Create
  {
    path: ':entity/:space/create',
    resolve: {
      context: ContextResolver
    },
    loadChildren: './space/create/create.module#CreateModule',
    data: {
      title: 'Create'
    }
  },

  // Space-settings
  {
    path: ':entity/:space/settings',
    resolve: {
      context: ContextResolver
    },
    loadChildren: './space/settings/space-settings.module#SpaceSettingsModule',
    data: {
      title: 'Areas'
    }
  },

  // App Launcher
  {
    path: ':entity/:space/applauncher',
    resolve: {
      context: ContextResolver,
      featureFlagConfig: FeatureFlagResolver
    },
    loadChildren: './space/app-launcher/app-launcher.module#AppLauncherModule',
    data: {
      title: 'App Launcher',
      featureName: 'AppLauncher'
    }
  },

  {
    path: '**',
    redirectTo: '/_error'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
