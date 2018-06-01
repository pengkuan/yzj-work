/**
 * @component TimeConflict 时间冲突列表
 */
<template lang="pug">
	.time-comflict
		.avatar
			span.picture
			span.name {{普罗旺斯}}
		.time-text {{当前选择时段}}
			span.time {{3月27日14：20-3月28日 20：30与ta冲突的日程：}}
		ui.conflict-list
			li(v-for="item of conflictList")
				i.iconfont
				.conflict-content
					.conflict-time {{15:00-16:00}}
					.conflict-text {{根据是会议还是日程选择是会议还是协作}}
		.contact 找Ta沟通

</template>

<script>
	export default {
		props: {
			conflictList: {
				type: Array,
				default: () => []
			}
		}
	}
</script>