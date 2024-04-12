<script>
	import { createEventDispatcher } from 'svelte'
	import { Input } from '$lib/components/ui/input'
	import { Label } from '$lib/components/ui/label'

	export let name = ''
	export let id = ''
	export let placeholder
	export let inputClass 
	export let value = ''
	export let isVisible = true // Assuming it's always visible
	export let error = ''
	export let touched = false
	export let required = true // Assuming it's always required
	export let props = {}

	const dispatch = createEventDispatcher()

	function handleChange(event) {
		touched = true
		dispatch('change', { name, value: event.target.value })
	}
</script>

{#if isVisible}
	<div class="grid w-full items-center gap-1.5 mb-4">
		<Label for={id}>{name}</Label>
		<Input
			type="text"
			{id}
			placeholder={placeholder||name}
			class={"dark:bg-black dark:text-white "+inputClass}
			bind:value
			on:input={handleChange}
			aria-invalid={error}
			aria-describedby="{name}-description"
			aria-required={required}
			{...props}
		/>
		<!--p class="text-sm text-muted-foreground">{name}</p-->
		{#if touched && error}
			<div id="{name}-error">{error}</div>
		{/if}
	</div>
{/if}
