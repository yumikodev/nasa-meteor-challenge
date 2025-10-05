<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	
	let { children } = $props();
</script>

<svelte:head>
	<title>Space Gen Z</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
