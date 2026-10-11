import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

/**
 * Providers injected into every test environment (passed to `ng test` with
 * `--providers-file`). Most standalone components render `routerLink`, which
 * needs the router providers, so without this each legacy "should create" spec
 * failed with `NG0201: No provider found for ActivatedRoute`.
 */
export default [
  provideRouter([]),
  provideHttpClient(),
];
