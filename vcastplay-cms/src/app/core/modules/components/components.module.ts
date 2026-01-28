import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ToolbarComponent } from '../../../shared/components/toolbar/toolbar.component';
import { DrawerComponent } from '../../../shared/components/drawer/drawer.component';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { FiltersComponent } from '../../../shared/components/filters/filters.component';
import { MapmarkersComponent } from '../../../shared/components/mapmarkers/mapmarkers.component';
import { ContentSelectionComponent } from '../../../shared/components/content-selection/content-selection.component';
import { WeekdayHourSelectionComponent } from '../../../shared/components/weekday-hour-selection/weekday-hour-selection.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { BroadcastListItemComponent } from '../../../user/settings/broadcast/broadcast-list-item/broadcast-list-item.component';
import { BroadcastDetailsComponent } from '../../../user/settings/broadcast/broadcast-details/broadcast-details.component';
import { UserListItemComponent } from '../../../shared/components/user-list-item/user-list-item.component';
import { UserApprovalComponent } from '../../../user/settings/users/user-approval/user-approval.component';
import { RoleListItemComponent } from '../../../user/settings/roles/role-list-item/role-list-item.component';
import { RoleDetailsComponent } from '../../../user/settings/roles/role-details/role-details.component';
import { DesignEditorToolsComponent } from '../../../user/design-layout/design-editor-tools/design-editor-tools.component';
import { ObjectPropertiesComponent } from '../../../user/design-layout/object-properties/object-properties.component';
import { DesignEditorPropertiesComponent } from '../../../user/design-layout/design-editor-properties/design-editor-properties.component';
import { DesignLayoutOptionsComponent } from '../../../user/design-layout/design-layout-options/design-layout-options.component';
import { DesignLayoutPreviewComponent } from '../../../user/design-layout/design-layout-preview/design-layout-preview.component';
import { DesignLayoutListItemComponent } from '../../../user/design-layout/design-layout-list-item/design-layout-list-item.component';
import { DesignLayoutToolsComponent } from '../../../user/design-layout/design-layout-tools/design-layout-tools.component';
import { ScheduleFillersComponent } from '../../../user/schedules/schedule-fillers/schedule-fillers.component';
import { ScheduleHourListComponent } from '../../../user/schedules/schedule-hour-list/schedule-hour-list.component';
import { ScheduleFilterComponent } from '../../../user/schedules/schedule-filter/schedule-filter.component';
import { ScheduleListItemComponent } from '../../../user/schedules/schedule-list-item/schedule-list-item.component';
import { SchedulesContentListComponent } from '../../../user/schedules/schedules-content-list/schedules-content-list.component';
import { AudienceTagFiltersComponent } from '../../../shared/components/audience-tag-filters/audience-tag-filters.component';
import { AssetToPlaylistComponent } from '../../../user/assets/asset-to-playlist/asset-to-playlist.component';
import { AssetPreviewComponent } from '../../../user/assets/asset-preview/asset-preview.component';
import { AssetFilterComponent } from '../../../user/assets/asset-filter/asset-filter.component';
import { AssetListItemComponent } from '../../../user/assets/asset-list-item/asset-list-item.component';
import { AssetAiGenerateComponent } from '../../../user/assets/asset-ai-generate/asset-ai-generate.component';
import { PlaylistPlayerComponent } from '../../../user/playlist/playlist-player/playlist-player.component';
import { PlaylistFilterComponent } from '../../../user/playlist/playlist-filter/playlist-filter.component';
import { PlaylistListItemComponent } from '../../../user/playlist/playlist-list-item/playlist-list-item.component';
import { PlaylistSelectContentsComponent } from '../../../user/playlist/playlist-select-contents/playlist-select-contents.component';
import { PlaylistContainerComponent } from '../../../user/playlist/playlist-container/playlist-container.component';
import { ScreenOtherInfoComponent } from '../../../shared/components/screen-other-info/screen-other-info.component';
import { ScreenDownloadComponent } from '../../../user/screens/screen-download/screen-download.component';
import { ScreenDetailsComponent } from '../../../user/screens/screen-details/screen-details.component';
import { ScreenSelectionComponent } from '../../../user/design-layout/screen-selection/screen-selection.component';
import { ScreenSettingsComponent } from '../../../shared/components/screen-settings/screen-settings.component';
import { ScreenBroadcastMessageComponent } from '../../../user/screen-management/screen-broadcast-message/screen-broadcast-message.component';
import { ScreenManagementListItemComponent } from '../../../user/screen-management/screen-management-list-item/screen-management-list-item.component';
import { ScreenControlsComponent } from '../../../user/screen-management/screen-controls/screen-controls.component';
import { ScreenFilterComponent } from '../../../user/screens/screen-filter/screen-filter.component';
import { ScreenListItemComponent } from '../../../shared/components/screen-list-item/screen-list-item.component';
import { UserDetailsComponent } from '../../../shared/components/user-details/user-details.component';
import { AssetUploadFileComponent } from '../../../user/assets/asset-upload-file/asset-upload-file.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { ScreenHealthStatusComponent } from '../../../shared/components/screen-health-status/screen-health-status.component';

const COMPONENT_MODULES = [
  CommonModule,
  CdkDrag,
  ToolbarComponent,
  DrawerComponent,
  BreadcrumbsComponent,
  FiltersComponent,
  MapmarkersComponent,
  ContentSelectionComponent,
  WeekdayHourSelectionComponent,
  FooterComponent,
  PaginatorComponent,

  // Broadcast Components
  BroadcastListItemComponent,
  BroadcastDetailsComponent,

  // Users Components
  UserListItemComponent,
  UserDetailsComponent,
  UserApprovalComponent,

  // Roles Components
  RoleListItemComponent,
  RoleDetailsComponent,

  // Screen Components
  ScreenFilterComponent,
  ScreenControlsComponent,
  ScreenManagementListItemComponent,
  ScreenBroadcastMessageComponent,
  ScreenSettingsComponent,
  ScreenSelectionComponent,
  ScreenDetailsComponent,
  ScreenDownloadComponent,
  ScreenOtherInfoComponent,
  ScreenListItemComponent,
  ScreenHealthStatusComponent,

  // Playlist Components
  PlaylistContainerComponent,
  PlaylistSelectContentsComponent,
  PlaylistListItemComponent,
  PlaylistFilterComponent,
  PlaylistPlayerComponent,

  // Asset Components
  AssetAiGenerateComponent,
  AssetListItemComponent,
  AssetFilterComponent,
  AssetPreviewComponent,
  AssetToPlaylistComponent,
  AssetUploadFileComponent,

  // Audience Tag Components
  AudienceTagFiltersComponent,

  // Schedule Components
  SchedulesContentListComponent,
  ScheduleListItemComponent,
  ScheduleFilterComponent,
  ScheduleHourListComponent,
  ScheduleFillersComponent,

  // Design Layout Components
  DesignLayoutToolsComponent,
  DesignLayoutListItemComponent,
  DesignLayoutPreviewComponent,
  DesignLayoutOptionsComponent,
  DesignEditorPropertiesComponent,
  ObjectPropertiesComponent,

  // Design Editor Components
  DesignEditorToolsComponent,
];

@NgModule({
  declarations: [],
  imports: [...COMPONENT_MODULES],
  exports: [...COMPONENT_MODULES],
})
export class ComponentsModule {}
