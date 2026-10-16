# angular — usage docs (source: Context7 /websites/angular_dev = angular.dev, current; fetched 2026-10-16)


## standalone components and signals

### Declare model and input signals in child component

Source: https://angular.dev/tutorials/signals/6-two-way-binding-with-model-signals

Imports model and input APIs to define a required two-way model signal alongside an optional input signal in a custom component.

```typescript
// Add imports for model signals
import {Component, model, input, ChangeDetectionStrategy} from '@angular/core';

// Model signal for two-way binding
checked = model.required<boolean>();

// Optional input for label
label = input<string>('');
```

--------------------------------

### Bootstrap a standalone root component

Source: https://angular.dev/api/platform-browser/bootstrapApplication

Bootstraps an Angular application using a standalone component. The root component passed into bootstrapApplication must be a standalone component.

```typescript
@Component({
  template: 'Hello world!'
})
class Root {}

const appRef: ApplicationRef = await bootstrapApplication(Root);
```

--------------------------------

### Convert declarations to standalone (After)

Source: https://angular.dev/reference/migrations/standalone

Shows the converted standalone component importing its direct template dependencies and the NgModule importing the standalone component instead of declaring it.

```typescript
@NgModule({
  imports: [CommonModule, Greeter],
  exports: [Greeter],
})
export class SharedModule {}
```

```typescript
@Component({
  selector: 'greeter',
  template: '<div *ngIf="showGreeting">Hello</div>',
  imports: [NgIf],
})
export class Greeter {
  showGreeting = true;
}
```

--------------------------------

### Declare signal inputs in a component class

Source: https://angular.dev/api/core/input

Initialize component class members with `input` or `input.required` to create optional, required, or default-valued signals.

```typescript
@Component({
  ...
})
export class UserProfileComponent {
  firstName = input<string>();             // Signal<string|undefined>
  lastName  = input.required<string>();    // Signal<string>
  age       = input(0)                     // Signal<number>
}
```

### Best practices & Style guide > Components

Source: https://angular.dev/assets/context/guidelines.md

- Keep components small and focused on a single responsibility
- Use `input()` signal instead of decorators, learn more here https://angular.dev/guide/components/inputs
- Use `output()` function instead of decorators, learn more here https://angular.dev/guide/components/outputs
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state learn more about signals here https://angular.dev/guide/signals.
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead, for context: https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings
- Do NOT use `ngStyle`, use `style` bindings instead, for context: https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`


## router configuration, lazy loading, guards

### Configure CanLoad guard on a lazy-loaded route

Source: https://angular.dev/api/router/CanLoad

Applies a CanLoad guard to a route definition and registers the guard and its dependencies in the module providers.

```typescript
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'team/:id',
        component: TeamComponent,
        loadChildren: () => import('./team').then(mod => mod.TeamModule),
        canLoad: [CanLoadTeamSection]
      }
    ])
  ],
  providers: [CanLoadTeamSection, UserToken, Permissions]
})
class AppModule {}
```

--------------------------------

### Configure route guards in Angular Routes definition

Source: https://angular.dev/guide/routing/route-guards

Configure route guards in route definitions to control navigation. Guards are specified as arrays and execute in the order they appear, supporting canActivate, canDeactivate, canActivateChild, and canMatch.

```typescript
import {Routes} from '@angular/router';
import {authGuard} from './guards/auth.guard';
import {adminGuard} from './guards/admin.guard';
import {canDeactivateGuard} from './guards/can-deactivate.guard';
import {featureToggleGuard} from './guards/feature-toggle.guard';

const routes: Routes = [
  // Basic CanActivate - requires authentication
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },

  // Multiple CanActivate guards - requires authentication AND admin role
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard],
  },

  // CanActivate + CanDeactivate - protected route with unsaved changes check
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard],
    canDeactivate: [canDeactivateGuard],
  },

  // CanActivateChild - protects all child routes
  {
    path: 'users', // /user - NOT protected
    canActivateChild: [authGuard],
    children: [
      // /users/list - PROTECTED
      {path: 'list', component: UserList},
      // /users/detail/:id - PROTECTED
      {path: 'detail/:id', component: UserDetail},
    ],
  },

  // CanMatch - conditionally matches route based on feature flag
  {
    path: 'beta-feature',
    component: BetaFeature,
    canMatch: [featureToggleGuard],
  },

  // Fallback route if beta feature is disabled
  {
    path: 'beta-feature',
    component: ComingSoon,
  },
];
```

--------------------------------

### Implement and configure CanActivate guard

Source: https://angular.dev/api/router/CanActivate

Demonstrates implementing a CanActivate guard class with injected dependencies and configuring it in the RouterModule route definition.

```typescript
class UserToken {}
class Permissions {
  canActivate(): boolean {
    return true;
  }
}

@Injectable()
class CanActivateTeam implements CanActivate {
  private readonly permissions = inject(Permissions);
  private readonly currentUser = inject(UserToken);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    return this.permissions.canActivate(this.currentUser, route.params.id);
  }
}
```

```typescript
@NgModule({
  imports: [
    RouterModule.forRoot([
      {
        path: 'team/:id',
        component: TeamComponent,
        canActivate: [CanActivateTeam]
      }
    ])
  ],
  providers: [CanActivateTeam, UserToken, Permissions]
})
class AppModule {}
```

--------------------------------

### Implement a CanLoad guard class

Source: https://angular.dev/api/router/CanLoad

Implements CanLoad to verify user permissions before allowing child routes to load. Return true to continue navigation, false to cancel, or a UrlTree to redirect.

```typescript
class UserToken {}
class Permissions {
  canLoadChildren(user: UserToken, id: string, segments: UrlSegment[]): boolean {
    return true;
  }
}

@Injectable()
class CanLoadTeamSection implements CanLoad {
  private readonly permissions = inject(Permissions);
  private readonly currentUser = inject(UserToken);

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
    return this.permissions.canLoadChildren(this.currentUser, route, segments);
  }
}
```

### Applying guards to routes

Source: https://angular.dev/guide/routing/route-guards

Once you've created your route guards, you need to configure them in your route definitions.
Guards are specified as arrays in the route configuration in order to allow you to apply multiple guards to a single route. They are executed in the order they appear in the array.


## HttpClient and SSR hydration

### Configure HTTP transfer cache with withHttpTransferCacheOptions

Source: https://angular.dev/best-practices/performance/ssr

Configures global HTTP transfer caching behavior during SSR and client hydration using withHttpTransferCacheOptions inside provideClientHydration. Allows customizing request filters, headers to transfer, and support for POST requests.

```typescript
import {bootstrapApplication} from '@angular/platform-browser';
import {provideClientHydration, withHttpTransferCacheOptions} from '@angular/platform-browser';

bootstrapApplication(App, {
  providers: [
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['ETag', 'Cache-Control'],
        filter: (req) => !req.url.includes('/api/profile'),
        includePostRequests: true,
        includeRequestsWithAuthHeaders: false,
      }),
    ),
  ],
});
```

--------------------------------

### provideClientHydration(...features: HydrationFeature<HydrationFeatureKind>[]): EnvironmentProviders

Source: https://angular.dev/api/platform-browser/provideClientHydration

Sets up providers necessary to enable hydration functionality for the application. By default, it enables reconciling DOM hydration, HTTP client caching transfer, and incremental hydration.

```APIDOC
## provideClientHydration

### Description
Sets up providers necessary to enable hydration functionality for the application. By default, the function enables the recommended set of features for the optimal performance for most applications, including DOM reconciliation, HttpClient response caching/transfer, and incremental hydration.

### Function Signature
```typescript
function provideClientHydration(
  ...features: HydrationFeature<HydrationFeatureKind>[]
): EnvironmentProviders;
```

### Parameters
- **...features** (`HydrationFeature<HydrationFeatureKind>[]`) - Optional - Optional features to configure additional hydration behaviors (e.g., `withNoHttpTransferCache`, `withHttpTransferCacheOptions`, `withI18nSupport`, `withEventReplay`, `withNoIncrementalHydration`).

### Returns
- **EnvironmentProviders** - A set of providers to enable hydration.

### Usage Example

#### Standalone Application (`bootstrapApplication`)
```typescript
bootstrapApplication(App, {
  providers: [provideClientHydration()]
});
```

#### NgModule-based Application
```typescript
@NgModule({
  declarations: [RootCmp],
  bootstrap: [RootCmp],
  providers: [provideClientHydration()],
})
export class AppModule {}
```
```

--------------------------------

### Provide HttpClient in appConfig

Source: https://angular.dev/guide/http/setup

Configures HttpClient within application providers using provideHttpClient in app.config.ts.

```typescript
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(/* add features here, such as withInterceptors(...) */)],
};
```

### Caching data when using HttpClient > Configuring the caching options

Source: https://angular.dev/assets/context/llms-full.txt

You can customize how Angular caches HTTP responses during server‑side rendering (SSR) and reuses them during hydration by configuring `HttpTransferCacheOptions`.  
This configuration is provided globally using `withHttpTransferCacheOptions` inside `provideClientHydration()`.

By default, `HttpClient` caches all `HEAD` and `GET` requests which don't contain `Authorization`, `Proxy-Authorization`, or `Cookie` headers and are not sent with `withCredentials` or Fetch API `credentials` modes that can send credentials. Angular also skips transfer cache when a request or response includes `Cache-Control` directives that forbid caching (`no-store`, `no-cache`, or `private`), or when the Fetch API `cache` option is set to `no-store` or `no-cache`. Responses that carry a `Set-Cookie` header are also skipped. You can override the request filtering settings by using `withHttpTransferCacheOptions` in the hydration configuration.

--------------------------------

### provideClientHydration > Description

Source: https://angular.dev/api/platform-browser/provideClientHydration

Sets up providers necessary to enable hydration functionality for the application.
By default, the function enables the recommended set of features for the optimal performance for most of the applications. It includes the following features:
  * Reconciling DOM hydration. Learn more about it here.
  * `HttpClient` response caching while running on the server and transferring this cache to the client to avoid extra HTTP requests. Learn more about data caching here. Incremental hydration. Learn more.

These functions allow you to disable some of the default features or enable new ones:
  * `withNoHttpTransferCache` to disable HTTP transfer cache
  * `withHttpTransferCacheOptions` to configure some HTTP transfer cache options
  * `withI18nSupport` to enable hydration support for i18n blocks
  * `withEventReplay` to enable support for replaying user events
  * `withNoIncrementalHydration` to disable incremental hydration
