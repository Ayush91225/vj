import { House, Plus, Rocket } from 'phosphor-react';

export const NAV_GROUPS = [
  { 
    label: null, 
    items: [
      { id: "project", label: "Home", icon: House },
      { id: "add", label: "New Project", icon: Plus },
      { id: "deploy", label: "Deployments", icon: Rocket },
    ]
  },
];
