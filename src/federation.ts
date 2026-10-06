import { initFederation } from '@angular-architects/native-federation';

export const federation = initFederation('federation.manifest.json', {
  hostRemoteEntry: { url: './remoteEntry.json' },
});
