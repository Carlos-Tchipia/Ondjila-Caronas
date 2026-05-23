export interface SidebarMenuItem {
  labelKey: string;
  icon: string;
  route: string;
}

export interface SidebarCta {
  labelKey: string;
  route: string;
  icon?: string;
}

export interface SidebarBrand {
  titleKey: string;
  subtitleKey?: string;
}
