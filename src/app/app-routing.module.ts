import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
// route guard
// import { AuthGuard } from "./shared/guard/auth.guard";
import { routes } from './shared/routes';

@NgModule({
    // imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
