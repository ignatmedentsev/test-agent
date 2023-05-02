import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DESKTOP_APP_HTTP_PORT } from '~desktop-app/constants';

import { AppInitService } from './app-init.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MAIN_HTTP_URL } from './main-url.token';
import { MainModule } from './pages/main/main.module';
import { OrganizationInfoModule } from './pages/organization-info/organization-info.module';
import { UpdateModule } from './pages/update/update.module';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { OrganizationService } from './services/organization.service';
import { SocketService } from './services/socket.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainModule,
    OrganizationInfoModule,
    UpdateModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: MAIN_HTTP_URL,
      useValue: `http://localhost:${DESKTOP_APP_HTTP_PORT}`,
    },
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: (appInitService: AppInitService) => async () => appInitService.init(),
      deps: [AppInitService],
      multi: true,
    },
    AuthService,
    OrganizationService,
    ApiService,
    SocketService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
