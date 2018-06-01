
<template lang="pug">
    .nav-bar
        .nav-item(:class="{'is-selected': value === 1}" @click="switchTab(1)") 日程{{undoWorkLen === 0 ? '' : `(${undoWorkLen})`}}
        .nav-item(:class="{'is-selected': value === 2}" @click="switchTab(2)") 会议{{undoMeetingLen === 0 ? '' : `(${undoMeetingLen})`}}
        .nav-item(:class="{'is-selected': value === 3}" @click="switchTab(3)") 记事
</template>

<script>
export default {
    props: {
        value: {
            type: Number
        }
    },
    computed: {
        undoWorkLen: function () {
            return this.$store.getters.undoWorkLen
        },
        undoMeetingLen: function () {
            return this.$store.getters.undoMeetingLen
        }
    },
    methods: {
        switchTab (type) {
            window.scrollTo(0, 0)
            this.$emit('input', type)
        }
    }
}
</script>


<style lang="less" scoped>
	.nav-bar {
        position: fixed;
        display: flex;
        padding: .13rem 0;
        z-index: 2;
        width: 100%;
        top: 0;
		background: #fff;
		.nav-item {
			flex: 1;
			text-align: center;
			color: #889AA4;
			font-size: .16rem;
			line-height: 1;
			&:not(:last-child) {
				border-right: .5px solid #DCE1E8;
			}
			&.is-selected {
                position: relative;
                color: #4598F0;
                &::after {
                    content: "";
                    position: absolute;
                    display: block;
                    height: .03rem;
                    width: 32%;
                    left: 34%;
                    bottom: -.13rem;
                    background: #4598F0;
                }
                // border-bottom: 3px solid #4598F0;
			}
		}
	}
</style>
