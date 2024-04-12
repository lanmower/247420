<script>
	import { ModeWatcher } from "mode-watcher"
	import '../app.postcss'
	import Sidebar from './components/Sidebar.svelte'
	import Countdown from './components/Countdown.svelte'
	export let data;
	$: ({ users } = data)
</script>
<ModeWatcher />
<Sidebar users={users} data={data}/>
<div class="flex-auto ml-64 ">
	<Countdown></Countdown>
	<slot />
</div>
