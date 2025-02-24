import { SaferwallClient } from '$lib/clients/saferwall';
import type { APIPagination, APIStrings } from '$lib/types';
import type { PageLoad } from './$types';

// TODO: implement search
export const load = (async ({ params, url }) => {
	const { hash } = params;

	const page = parseInt(url.searchParams.get('page')!) || 1;
	const per_page = parseInt(url.searchParams.get('per_page')!) || 10;

	const urlParams = new URLSearchParams();
	if (page > 0) {
		urlParams.append('page', page.toString());
	}
	if (per_page > 0) {
		urlParams.append('per_page', per_page.toString());
	}

	const pagination = await new SaferwallClient().request<APIPagination<APIStrings>>(
		`files/${hash}/strings?${urlParams.toString()}`
	);
	pagination.items = pagination.items ?? [];

	return {
		pagination
	};
}) satisfies PageLoad;
