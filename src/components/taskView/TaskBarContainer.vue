
<template lang="pug">
    .tab-container-wrap(class="mobile-mt")
        ScheduleContainer(v-show="value === 1")
        MeetingContainer(v-show="value === 2")
        RecordContainer(v-show="value === 3")
</template>

<script>
import ScheduleContainer from '@/components/taskView/ScheduleContainer'
import MeetingContainer from '@/components/taskView/MeetingContainer'
import RecordContainer from '@/components/taskView/RecordContainer'

export default {
    props: {
        value: {
            default: 1
        }
    },
    components: {
        ScheduleContainer,
        MeetingContainer,
        RecordContainer
    }
}
</script>

<style lang="less" scoped>
    .mobile-mt {
        border-top: .49rem #F8F9FB solid;
    }
    .tab-container-wrap {
        height: 100%;
        background: #F8F9FB;
        // border-top: .49rem #F8F9FB solid;
    }
</style>

