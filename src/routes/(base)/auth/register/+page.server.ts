import { fail } from '@sveltejs/kit';
import { SaferwallClient } from '$lib/clients/saferwall';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ parent }: any) => {
	await parent();
	return {};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		const email = data.get('email') as string;
		const username = data.get('username') as string;
		const password = data.get('password') as string;

		const requiredFields: Record<string, boolean> = {};
		if (!email) requiredFields.email = true;
		if (!username) requiredFields.username = true;
		if (!password) requiredFields.password = true;

		if (Object.keys(requiredFields).length > 0) {
			return fail(400, { ...requiredFields, missing: true });
		}

		try {
			await new SaferwallClient().signUp({
				email,
				username,
				password
			});

			return { success: true };
		} catch (response: any) {
			return fail(400, await response.json());
		}
	}
} satisfies Actions;
