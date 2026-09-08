export interface SocialLink {
  name: string;
  handle: string;
  url: string;
  icon: 'facebook' | 'instagram' | 'tiktok' | 'x';
}

export const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    handle: '@tacsfon_oaustech',
    url: 'https://instagram.com/tacsfon_oaustech',
    icon: 'instagram',
  },
  {
    name: 'Facebook',
    handle: 'Tacsfon (Oaustech)',
    url: 'https://facebook.com/tacsfon_oaustech',
    icon: 'facebook',
  },
  {
    name: 'TikTok',
    handle: '@tacsfon_oaustech',
    url: 'https://tiktok.com/@tacsfon_oaustech',
    icon: 'tiktok',
  },
  {
    name: 'X (Twitter)',
    handle: '@tacsfon_oaustech',
    url: 'https://x.com/tacsfon_oaustech',
    icon: 'x',
  },
];
