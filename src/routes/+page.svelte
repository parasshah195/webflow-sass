<script lang="ts">
	import '$lib/css/style.scss';

	import { onMount } from 'svelte';
	import EditorForm from './EditorForm.svelte';

	onMount(async () => {
		await webflow.setExtensionSize({ width: 500, height: 1080 });
	});
</script>

<main>
	<EditorForm />
</main>
