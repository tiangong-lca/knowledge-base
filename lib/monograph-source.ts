import { loader } from 'fumadocs-core/source';
import { defineDocs } from 'fumadocs-mdx/macro';
// Deliberately separate from website source/search/routes.
const manuscripts = defineDocs({ dir: 'content/monograph' });
export const monographSource = loader({ baseUrl: '/monograph', source: manuscripts.toFumadocsSource() });
