// Toutes les routes du site au même endroit : si un lien est faux, corrige-le ici.
export const ROUTES = {
  home: '/',
  becomeTeacher: '/donner-cours',
  login: '/connexion',
  about: '/about',
  contact: '/contact',
  terms: '/conditions',
  privacy: '/confidentialite',
  professor: (id: string) => `/professeurs/${id}`,
};