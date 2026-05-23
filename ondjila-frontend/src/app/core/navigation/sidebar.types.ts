export interface SidebarMenuItem {
  label: string;
  icon: string;
  route: string;
}

export interface SidebarCta {
  label: string;
  route: string;
  icon?: string;
}

export interface SidebarBrand {
  title: string;
  subtitle?: string;
}
