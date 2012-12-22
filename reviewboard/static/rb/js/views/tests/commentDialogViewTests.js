describe('views/CommentDialogView', function() {
    describe('Class methods', function() {
        describe('create', function() {
            it('Without a comment', function() {
                expect(function() {
                    RB.CommentDialogView.create({
                        animate: false,
                        container: $testsScratch
                    });
                }).toThrow();

                expect(RB.CommentDialogView._instance).toBeFalsy();
                expect($testsScratch.children().length).toBe(0);
            });

            it('With a comment', function() {
                var dlg = RB.CommentDialogView.create({
                    animate: false,
                    comment: new RB.DiffComment(),
                    container: $testsScratch
                });

                expect(dlg).toBeTruthy();
                expect(RB.CommentDialogView._instance).toBe(dlg);
                expect($testsScratch.children().length).toBe(1);
            });

            it('Replacing an open dialog', function() {
                var dlg1,
                    dlg2;

                dlg1 = RB.CommentDialogView.create({
                    animate: false,
                    comment: new RB.DiffComment(),
                    container: $testsScratch
                });
                expect(dlg1).toBeTruthy();

                dlg2 = RB.CommentDialogView.create({
                    animate: false,
                    comment: new RB.DiffComment(),
                    container: $testsScratch
                });
                expect(dlg2).toBeTruthy();

                expect(dlg2).not.toBe(dlg1);
                expect(dlg1.$el.parents().length).toBe(0);
                expect(RB.CommentDialogView._instance).toBe(dlg2);
                expect($testsScratch.children().length).toBe(1);
            });
        });
    });

    describe('Instances', function() {
        var editor,
            dlg;

        beforeEach(function() {
            editor = new RB.CommentEditor({
                comment: new RB.DiffComment(),
                canEdit: true
            });

            dlg = new RB.CommentDialogView({
                animate: false,
                model: editor
            });

            dlg.on('closed', function() {
                dlg = null;
            });

            dlg.render().$el.appendTo($testsScratch);
        });

        afterEach(function() {
            if (dlg) {
                dlg.close();
            }
        });

        describe('Buttons', function() {
            describe('Cancel', function() {
                var $button;

                beforeEach(function() {
                    $button = dlg.$el.find('.buttons .cancel');
                });

                it('Enabled', function() {
                    expect($button.is(':disabled')).toBe(false);
                });

                it('Cancels editor when clicked', function() {
                    spyOn(editor, 'cancel');
                    $button.click();
                    expect(editor.cancel).toHaveBeenCalled();
                });

                it('Closes dialog when clicked', function() {
                    spyOn(editor, 'cancel');
                    spyOn(dlg, 'close');
                    $button.click();
                    expect(dlg.close).toHaveBeenCalled();
                });
            });

            describe('Delete', function() {
                var $button;

                beforeEach(function() {
                    $button = dlg.$el.find('.buttons .delete');
                });

                it('Enabled when editor.canDelete=true', function() {
                    editor.set('canDelete', true);
                    expect($button.is(':disabled')).toBe(false);
                });

                it('Disabled when editor.canDelete=false', function() {
                    editor.set('canDelete', false);
                    expect($button.is(':disabled')).toBe(true);
                });

                it('Cancels editor when clicked', function() {
                    editor.set('canDelete', true);
                    spyOn(editor, 'deleteComment');
                    $button.click();
                    expect(editor.deleteComment).toHaveBeenCalled();
                });

                it('Closes dialog when clicked', function() {
                    editor.set('canDelete', true);
                    spyOn(editor, 'deleteComment');
                    spyOn(dlg, 'close');
                    $button.click();
                    expect(dlg.close).toHaveBeenCalled();
                });
            });

            describe('Save', function() {
                var $button;

                beforeEach(function() {
                    $button = dlg.$el.find('.buttons .save');
                });

                it('Enabled when editor.canSave=true', function() {
                    editor.set('canSave', true);
                    expect($button.is(':disabled')).toBe(false);
                });

                it('Disabled when editor.canSave=false', function() {
                    editor.set('canSave', false);
                    expect($button.is(':disabled')).toBe(true);
                });

                it('Cancels editor when clicked', function() {
                    editor.set('canSave', true);
                    spyOn(editor, 'save');
                    $button.click();
                    expect(editor.save).toHaveBeenCalled();
                });

                it('Closes dialog when clicked', function() {
                    editor.set('canSave', true);
                    spyOn(editor, 'save');
                    spyOn(dlg, 'close');
                    $button.click();
                    expect(dlg.close).toHaveBeenCalled();
                });
            });
        });

        describe('Other published comments list', function() {
            var $commentsList,
                $commentsPane;

            beforeEach(function() {
                $commentsPane = dlg.$el.find('.other-comments');
                $commentsList = $commentsPane.children('ul');
                expect($commentsList.length).toBe(1);
            });

            describe('Empty list', function() {
                it('Hidden pane', function() {
                    expect($commentsPane.is(':visible')).toBe(false);
                });
            });

            describe('Populated list', function() {
                var comment;

                beforeEach(function() {
                    comment = new RB.DiffComment();
                    comment.user = {
                        'name': 'Teset User'
                    };
                    comment.url = 'http://example.com/';
                    comment.comment_id = 1;
                    comment.text = 'Sample comment.';
                    comment.issue_opened = false;
                });

                describe('Visible pane', function() {
                    it('Setting list before opening dialog', function() {
                        editor.set('publishedComments', [comment])
                        dlg.open();
                        expect($commentsPane.is(':visible')).toBe(true);
                    });

                    it('Setting list after opening dialog', function() {
                        dlg.open();
                        editor.set('publishedComments', [comment])
                        expect($commentsPane.is(':visible')).toBe(true);
                    });
                });

                it('List items added', function() {
                    dlg.open();
                    editor.set('publishedComments', [comment])
                    expect($commentsList.children().length).toBe(1);
                });
            });
        });

        describe('Methods', function() {
            describe('close', function() {
                it('Editor state', function() {
                    dlg.open();
                    expect(editor.get('editing')).toBe(true);
                    dlg.close();
                    expect(editor.get('editing')).toBe(false);
                });

                it('Dialog removed', function() {
                    dlg.open();

                    spyOn(dlg, 'trigger');

                    dlg.close();
                    expect(dlg.trigger).toHaveBeenCalledWith('closed');
                    expect(dlg.$el.parents().length).toBe(0);
                    expect($testsScratch.children().length).toBe(0);
                });
            });

            describe('open', function() {
                it('Editor state', function() {
                    expect(editor.get('editing')).toBe(false);
                    dlg.open();
                    expect(editor.get('editing')).toBe(true);
                });

                it('Visibility', function() {
                    expect(dlg.$el.is(':visible')).toBe(false);
                    dlg.open();
                    expect(dlg.$el.is(':visible')).toBe(true);
                });

                it('Default focus', function() {
                    var $textarea = dlg.$el.find('textarea');

                    expect($textarea.is(':focus')).toBe(false);
                    spyOn($textarea[0], 'focus');

                    dlg.open();
                    expect($textarea[0].focus).toHaveBeenCalled();
                });
            });
        });

        describe('Special keys', function() {
            var $textarea;

            function simulateKeyPress(c, altKey, ctrlKey) {
                var e;

                $textarea.focus();

                _.each(['keydown', 'keypress', 'keyup'], function(type) {
                    e = $.Event(type);
                    e.which = c;
                    e.altKey = altKey;
                    e.ctrlKey = ctrlKey;
                    $textarea.trigger(e);
                });
            }

            beforeEach(function() {
                dlg.open();
                $textarea = dlg.$el.find('textarea');
            });

            describe('Control-Enter to save', function() {
                beforeEach(function() {
                    spyOn(editor, 'save');
                    spyOn(dlg, 'close');
                });

                describe('With editor.canSave=true', function() {
                    beforeEach(function() {
                        editor.set('canSave', true);
                    });

                    it('Keycode 10', function() {
                        simulateKeyPress(10, false, true);
                        expect(editor.save).toHaveBeenCalled();
                        expect(dlg.close).toHaveBeenCalled();
                    });

                    it('Keycode 13', function() {
                        simulateKeyPress(13, false, true);
                        expect(editor.save).toHaveBeenCalled();
                        expect(dlg.close).toHaveBeenCalled();
                    });
                });

                describe('With editor.canSave=false', function() {
                    beforeEach(function() {
                        editor.set('canSave', false);
                    });

                    it('Keycode 10', function() {
                        simulateKeyPress(10, false, true);
                        expect(editor.save).not.toHaveBeenCalled();
                        expect(dlg.close).not.toHaveBeenCalled();
                    });

                    it('Keycode 13', function() {
                        simulateKeyPress(13, false, true);
                        expect(editor.save).not.toHaveBeenCalled();
                        expect(dlg.close).not.toHaveBeenCalled();
                    });
                });
            });

            describe('Escape to cancel', function() {
                it('Pressing escape in text area', function() {
                    spyOn(editor, 'cancel');
                    spyOn(dlg, 'close');

                    simulateKeyPress($.ui.keyCode.ESCAPE, false, false);
                    expect(editor.cancel).toHaveBeenCalled();
                    expect(dlg.close).toHaveBeenCalled();
                });
            });

            describe('Toggle open issue', function() {
                var $checkbox;

                function runToggleIssueTest(startState, keyCode) {
                    $checkbox.prop('checked', startState);
                    editor.set('openIssue', startState);

                    simulateKeyPress(73, true, false);

                    expect($checkbox.prop('checked')).toBe(!startState);
                    expect(editor.get('openIssue')).toBe(!startState);
                    expect($textarea.val()).toBe('');
                }

                beforeEach(function() {
                    $checkbox = dlg.$el.find('input[type=checkbox]');
                });

                describe('Alt-I', function() {
                    it('Checked to unchecked', function() {
                        runToggleIssueTest(true, 'I');
                    });

                    it('Unchecked to checked', function() {
                        runToggleIssueTest(false, 'I');
                    });
                });

                describe('Alt-i', function() {
                    it('Checked to unchecked', function() {
                        runToggleIssueTest(true, 'i');
                    });

                    it('Unchecked to checked', function() {
                        runToggleIssueTest(false, 'i');
                    });
                });
            });
        });

        describe('Status text', function() {
            var $statusText;

            beforeEach(function() {
                dlg.open();
                $statusText = dlg.$el.find('form .status');
            });

            it('Default state', function() {
                expect($statusText.text()).toBe('');
            });

            it('Showing new text', function() {
                var text = 'Testing';

                editor.set('statusText', text);
                expect($statusText.text()).toBe(text);
            });

            it('Setting to null', function() {
                editor.set('statusText', 'Testing');
                editor.set('statusText', null);

                expect($statusText.text()).toBe('');
            });
        });

        describe('State synchronization', function() {
            describe('Comment text', function() {
                var $textarea;

                function simulateTyping(text) {
                    var i;

                    $textarea.focus();

                    for (i = 0; i < text.length; i++) {
                        var c = text.charCodeAt(i),
                            e;

                        e = $.Event('keydown');
                        e.which = c;
                        $textarea.trigger(e);

                        e = $.Event('keypress');
                        e.which = c;
                        $textarea.trigger(e);

                        $textarea.val($textarea.val() + text[i]);

                        e = $.Event('keyup');
                        e.which = c;
                        $textarea.trigger(e);
                    }

                    expect($textarea.val()).toEqual(text);
                }

                beforeEach(function() {
                    dlg.open();
                    $textarea = dlg.$el.find('textarea');
                });

                it('Dialog to editor', function() {
                    var text = 'foo';

                    simulateTyping(text);
                    expect(editor.get('text')).toEqual(text);
                });

                it('Editor to dialog', function() {
                    var text = 'bar';

                    editor.set('text', text);
                    expect($textarea.val()).toEqual(text);
                });
            });

            describe('Open Issue checkbox', function() {
                var $checkbox;

                beforeEach(function() {
                    dlg.open();
                    $checkbox = dlg.$el.find('input[type=checkbox]');
                    $checkbox.prop('checked', false);
                    editor.set('openIssue', false);
                });

                it('Dialog to editor', function() {
                    $checkbox.click();
                    expect(editor.get('openIssue')).toBe(true);
                });

                it('Editor to dialog', function() {
                    editor.set('openIssue', true);
                    expect($checkbox.prop('checked')).toBe(true);
                });
            });
        });
    });
});
