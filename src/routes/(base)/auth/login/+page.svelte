<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/form/Input.svelte';
	import Button from '$lib/components/form/Button.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { redirect } from '@sveltejs/kit';

	let loading = false;
	let error: string = '';
	let errors: Record<string, boolean> = {};

	const handleFormSubmit = (_event: any) => {
		error = '';
		errors = {};
		loading = true;

		return async ({ result, update }: any) => {
			const { data, type } = result;

			if (type === 'failure') {
				errors = data;
				error = data?.message;

				loading = false;
				return;
			}

			redirect(303, '/');
			update();
		};
	};
</script>

<svelte:head>
	<title>Sign in - Saferwall</title>
</svelte:head>

<form
	method="POST"
	use:enhance={handleFormSubmit}
	class="flex flex-col space-y-6 px-10 lg:px-16 pt-14"
>
	<h1 class="text-3xl font-bold">Sign in</h1>
	{#if error}
		<Alert type="error" on:close={() => (error = '')}>{error}</Alert>
	{/if}
	<div class="space-y-4">
		<Input label="Username or email" name="username" error={errors.username} disabled={loading} />
		<Input
			label="Password"
			type="password"
			name="password"
			error={errors.password}
			disabled={loading}
		/>
	</div>
	<a href="/auth/forget-password" class="self-end border-l-pink-50">Forget password?</a>

	<Button theme="primary" type="submit" {loading} size="lg">Login</Button>

	<p class="text-center text-sm">
		Didn't confirm registration? <a href="/auth/confirm" class="link">Send confirmation</a>
	</p>
</form>
<div class="border-t border-neutral-100 p-6">
	<p class="text-center text-sm">
		Not a member ? <a href="/auth/register" class="link">Create your account</a>
	</p>
</div>
