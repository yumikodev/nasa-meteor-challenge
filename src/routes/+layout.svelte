<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/logo.webp';
	
	let { children } = $props();
</script>

<svelte:head>
	<title>Space Gen Z</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
