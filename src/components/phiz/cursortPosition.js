/*
* 设置光标位置
* */

let setCursor = {
    cursorPos: 0,
    getCursorPosition ($text) {
        // 获取焦点
        let _cursorPos = 0
        if (document.selection) {
            let selectRange = document.selection.createRange()
            selectRange.moveStart('character', -$text.value.length)
            _cursorPos = selectRange.text.length
        } else if ($text.selectionStart || $text.selectionStart === '0') {
            _cursorPos = $text.selectionStart
        }
        this.cursorPos = _cursorPos
        return _cursorPos
    },
    moveCursor (node, offset) {
        node.focus()
        if (document.selection) {
            var sel = node.createTextRange()
            sel.moveStart('character', offset)
            sel.collapse()
            sel.select()
        } else if (typeof node.selectionStart === 'number' && typeof node.selectionEnd === 'number') {
            node.selectionStart = node.selectionEnd = offset
        }
        this.cursorPos = offset
    },
    insertTextByRecord ($text, value) {
        // // 获取最新的位置
        // this.getCursorPosition($text)
        // 插入文本（不主动获取光标）
        $text.value = $text.value.substring(0, this.cursorPos) + value + $text.value.substring(this.cursorPos, $text.value.length)
        $text.blur()
        this.cursorPos += value.length
        // this.moveCursor($text, this.cursorPos)
    },
    insertTextToInput ($text, value) {
        // 获取最新的位置
        this.getCursorPosition($text)
        this.insertTextByRecord($text, value)
        this.moveCursor($text, this.cursorPos)
    },
    delPhiz ($text) {
        // 删除表情
        let pos = this.cursorPos
        pos && pos--
        // $text.blur()
        $text.value = $text.value.substring(0, pos) + $text.value.substring(this.cursorPos, $text.value.length)
        this.cursorPos --
        this.moveCursor($text, this.cursorPos)
    }
    // insertText ($text, value) {
    //     // 插入文本（每次都获取焦点）
    //     let selectRange
    //     if (document.selection) {
    //       // IE Support
    //         selectRange = document.selection.createRange()
    //         selectRange.text = value
    //     } else if ($text.selectionStart || $text.selectionStart === '0') {
    //         // Firefox support
    //         let startPos = $text.selectionStart
    //         let endPos = $text.selectionEnd
    //
    //         $text.value = $text.value.substring(0, startPos) + value + $text.value.substring(endPos, $text.value.length)
    //         $text.selectionStart = startPos + value.length
    //         $text.selectionEnd = startPos + value.length
    //         $text.blur()
    //     } else {
    //         $text.value += value
    //         $text.selectionStart = value.length
    //         $text.selectionEnd = value.length
    //         $text.blur()
    //     }
    //     // this.setPosition($text)
    // },
    // delText ($text) {
    //     let selectRange
    //     let value = $text.value
    //
    //     if (document.selection) {
    //         // IE Support
    //         selectRange = document.selection.createRange()
    //         selectRange.text = value.slice(0, value.length - 1)
    //     } else if ($text.selectionStart || $text.selectionStart === '0') {
    //         // Firefox support
    //         let startPos = $text.selectionStart
    //         let endPos = $text.selectionEnd
    //         // let scrollTop = $text.scrollTop
    //         startPos === endPos && startPos !== 0 && startPos--
    //         console.log('pppp:', startPos)
    //         console.log('pp3pp:', endPos)
    //         $text.value = value.substring(0, startPos) + value.substring(endPos, value.length)
    //         $text.selectionStart = startPos
    //         $text.selectionEnd = startPos
    //         $text.blur()
    //       // $text.scrollTop = scrollTop
    //     }
    // },
    // isMobile: /Android|iPhone|iPad/g.test(navigator.userAgent),
    // setPosition ($text) {
    //     let pos = this.getCursorPosition($text)
    //     console.log('??????:', pos)
    //     if ($text.setSelectionRange) {
    //       // IE Support
    //         console.log('isMobile????:', this.isMobile)
    //         // !this.isMobile && $text.focus()
    //         $text.setSelectionRange(pos, pos)
    //     } else if ($text.createTextRange) {
    //       // Firefox support
    //       //   console.log('3333222223:')
    //         let range = $text.createTextRange()
    //         range.collapse(true)
    //         range.moveEnd('character', pos)
    //         range.moveStart('character', pos)
    //       // range.select();
    //     }
    // }
}

export default setCursor
