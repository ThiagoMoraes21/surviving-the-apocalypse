import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
    {
        title: 'Dashboard',
        icon: 'home-outline',
        link: '/dashboard',
        home: true,
    },
    {
        title: 'Survivors',
        icon: 'people-outline',
        link: '/survivors'
    },
    {
        title: 'Inventory',
        icon: 'briefcase-outline',
        link: '/inventory',
    },
    {
        title: 'Reports',
        icon: 'pie-chart-outline',
        link: '/reports',
    }
];
