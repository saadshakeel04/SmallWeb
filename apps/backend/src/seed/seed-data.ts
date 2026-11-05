export const SEED_PEOPLE = [
  {
    id: '650000000000000000000001',
    name: 'Saad Shakeel',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '650000000000000000000002',
    name: 'Babar Azam',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: '650000000000000000000003',
    name: 'Ch Abdullah',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
] as const;

const CONTENT = {
  tidepool: `At low tide, the pools along the north shore become small windows into a larger world. Anemones fold in the sun, shrimp move between ribbons of kelp, and the water keeps a little of the sky. Sana visits every week to record what has changed. Start with <a href="https://paperboats.zz">the paper boat journal</a>, then follow the shore toward <a href="https://quietforest.zz">Quiet Forest</a>. A path to <a href="https://glassgarden.zz">Glass Garden</a> is listed here too, though that address has never been built.`,
  paperboats: `The paper boat journal began with notes passed between two neighbors on rainy afternoons. Each page carries a small observation: a gutter full of leaves, a cloud shaped like a sail, or a name written on a folded map. Theo keeps the archive and adds a new entry when the weather turns. The next page is <a href="https://quietforest.zz">a walk through Quiet Forest</a>.`,
  quietforest: `Quiet Forest is a narrow woodland where the path follows a stream rather than a signpost. Ferns soften the banks, and old beech trees hold the sound of rain long after the clouds have moved away. Sana's field notes describe the place in every season. From here, watch the evening arrive at <a href="https://bluehour.zz">Blue Hour</a> or return to <a href="https://tidepool.zz">the changing tide pools</a>.`,
  bluehour: `Blue Hour is a collection of short observations made in the minutes between sunset and night. The windows across the harbor glow one by one, while the water shifts from silver to ink. Theo pairs each note with a quiet question about how a familiar place changes after dark. Continue the walk at <a href="https://clockworkcafe.zz">Clockwork Cafe</a>.`,
  clockworkcafe: `Clockwork Cafe sits beside a station that no longer has a timetable. Its brass clock is five minutes slow, which gives visitors time to finish their tea and watch the rain cross the glass. Sana writes down the conversations she overhears, then leaves the notebook open for the next person. Nearby, <a href="https://cloudlibrary.zz">Cloud Library</a> keeps a different kind of collection.`,
  cloudlibrary: `Cloud Library lends stories that fit inside a single walk. The shelves are arranged by the weather outside: bright pages for clear skies, long chapters for rain, and a drawer of tiny poems for fog. Theo tends the reading room and accepts handwritten recommendations. One telescope is kept on the roof at <a href="https://tinyobservatory.zz">Tiny Observatory</a>.`,
  tinyobservatory: `Tiny Observatory was built from a garden shed, two lenses, and a careful notebook. On clear evenings, Sana records the moon's position and invites visitors to compare their sketches. The telescope is small enough to carry, but the questions it raises are not. After stargazing, take the footpath to <a href="https://mossywindow.zz">Mossy Window</a>.`,
  mossywindow: `Mossy Window looks into a courtyard where a patient gardener grows mint, thyme, and an assortment of plants that arrived without labels. Mara photographs the changing patch of green and leaves notes for whoever tends it next. Every picture includes the date and the sound of the weather. The courtyard's old objects are catalogued at <a href="https://pocketmuseum.zz">Pocket Museum</a>.`,
  pocketmuseum: `Pocket Museum collects things that are too ordinary to appear in a grand gallery: a smooth stone, a ticket stub, a key with no known door. Sana writes a short account of each object and the person who chose to keep it. The collection is small enough to explore in an afternoon. Its latest postcard came from <a href="https://starlingpost.zz">Starling Post</a>.`,
  starlingpost: `Starling Post is a neighborhood letter desk with a map of every route its mail has taken. Mara pins up postcards when they arrive and copies the handwritten directions into a public notebook. Some journeys are short; others cross the entire small web. The desk closes at dusk, when the birds settle on the station roof.`,
} as const;

function plainTextFromSeedHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const site = (
  id: string,
  address: string,
  title: string,
  html: string,
  authorId: string,
) => ({
  id,
  address,
  title,
  html: `<main><h1>${title}</h1><p>${html}</p></main>`,
  plainText: plainTextFromSeedHtml(`<h1>${title}</h1><p>${html}</p>`),
  authorId,
  createdAt: '2025-01-02T12:00:00.000Z',
  updatedAt: '2025-01-02T12:00:00.000Z',
});

export const SEED_SITES = [
  site('660000000000000000000001', 'tidepool.zz', 'Tidepool Notes', CONTENT.tidepool, SEED_PEOPLE[0].id),
  site('660000000000000000000002', 'paperboats.zz', 'Paper Boat Journal', CONTENT.paperboats, SEED_PEOPLE[1].id),
  site('660000000000000000000003', 'quietforest.zz', 'Quiet Forest', CONTENT.quietforest, SEED_PEOPLE[0].id),
  site('660000000000000000000004', 'bluehour.zz', 'Blue Hour', CONTENT.bluehour, SEED_PEOPLE[1].id),
  site('660000000000000000000005', 'clockworkcafe.zz', 'Clockwork Cafe', CONTENT.clockworkcafe, SEED_PEOPLE[0].id),
  site('660000000000000000000006', 'cloudlibrary.zz', 'Cloud Library', CONTENT.cloudlibrary, SEED_PEOPLE[1].id),
  site('660000000000000000000007', 'tinyobservatory.zz', 'Tiny Observatory', CONTENT.tinyobservatory, SEED_PEOPLE[0].id),
  site('660000000000000000000008', 'mossywindow.zz', 'Mossy Window', CONTENT.mossywindow, SEED_PEOPLE[2].id),
  site('660000000000000000000009', 'pocketmuseum.zz', 'Pocket Museum', CONTENT.pocketmuseum, SEED_PEOPLE[0].id),
  site('660000000000000000000010', 'starlingpost.zz', 'Starling Post', CONTENT.starlingpost, SEED_PEOPLE[2].id),
] as const;

const visit = (
  id: string,
  personIndex: number,
  siteIndex: number,
  visitedAt: string,
  source: 'typed' | 'link' | 'history' | 'search',
) => ({
  id,
  personId: SEED_PEOPLE[personIndex].id,
  siteId: SEED_SITES[siteIndex].id,
  address: SEED_SITES[siteIndex].address,
  visitedAt,
  source,
});

export const SEED_VISITS = [
  visit('670000000000000000000001', 0, 0, '2025-01-03T10:00:00.000Z', 'typed'),
  visit('670000000000000000000002', 0, 1, '2025-01-03T10:06:00.000Z', 'link'),
  visit('670000000000000000000003', 0, 2, '2025-01-03T10:12:00.000Z', 'link'),
  visit('670000000000000000000004', 0, 3, '2025-01-03T10:18:00.000Z', 'link'),
  visit('670000000000000000000005', 0, 4, '2025-01-03T10:24:00.000Z', 'link'),
  visit('670000000000000000000006', 0, 5, '2025-01-03T10:30:00.000Z', 'link'),
  visit('670000000000000000000007', 0, 6, '2025-01-03T10:36:00.000Z', 'link'),
  visit('670000000000000000000008', 0, 7, '2025-01-03T10:42:00.000Z', 'link'),
  visit('670000000000000000000009', 0, 8, '2025-01-03T10:48:00.000Z', 'link'),
  visit('670000000000000000000010', 0, 9, '2025-01-03T10:54:00.000Z', 'link'),
  visit('670000000000000000000011', 0, 1, '2025-01-03T11:00:00.000Z', 'history'),
  visit('670000000000000000000012', 1, 1, '2025-01-03T10:05:00.000Z', 'typed'),
  visit('670000000000000000000013', 1, 2, '2025-01-03T10:13:00.000Z', 'link'),
  visit('670000000000000000000014', 1, 0, '2025-01-03T10:21:00.000Z', 'history'),
  visit('670000000000000000000015', 1, 6, '2025-01-03T10:40:00.000Z', 'search'),
  visit('670000000000000000000016', 2, 5, '2025-01-03T10:25:00.000Z', 'typed'),
  visit('670000000000000000000017', 2, 7, '2025-01-03T10:36:00.000Z', 'link'),
  visit('670000000000000000000018', 2, 9, '2025-01-03T10:55:00.000Z', 'link'),
] as const;
