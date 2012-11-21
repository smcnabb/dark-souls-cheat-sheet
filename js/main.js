(function($) {

    var defaultProfiles = {
        'current': 'Default Profile',
        'profiles': {
            'Default Profile': {
                checklistData: {}
            }
        }
    };
    var profiles = $.jStorage.get('profiles', defaultProfiles);

    jQuery(document).ready(function($) {

        // TODO Find a better way to do this in one pass
        $('ul li li').each(function(index) {
            if ($(this).attr('data-id')) {
                addCheckbox(this);
            }
        });
        $('ul li').each(function(index) {
            if ($(this).attr('data-id')) {
                addCheckbox(this);
            }
        });

        populateProfiles();

        $('input[type="checkbox"]').click(function() {
            var id = $(this).attr('id');
            var isChecked = profiles.profiles[profiles.current].checklistData[id] = $(this).prop('checked');
            _gaq.push(['_trackEvent', 'Checkbox', (isChecked ? 'Check' : 'Uncheck'), id]);
            $(this).parent().parent().find('li > label > input[type="checkbox"]').each(function() {
                var id = $(this).attr('id');
                profiles.profiles[profiles.current].checklistData[id] = isChecked;
                $(this).prop('checked', isChecked);
            });
            $.jStorage.set('profiles', profiles);
        });

        $('#profiles').change(function(event) {
            profiles.current = $(this).val();
            $.jStorage.set('profiles', profiles);
            populateChecklists();
            _gaq.push(['_trackEvent', 'Profile', 'Change', profiles.current]);
        });

        $('#profileAdd').click(function() {
            $('#profileModalTitle').html('Add Profile');
            $('#profileModalName').val('');
            $('#profileModalAdd').show();
            $('#profileModalUpdate').hide();
            $('#profileModalDelete').hide();
            $('#profileModal').modal('show');
            _gaq.push(['_trackEvent', 'Profile', 'Add']);
        });

        $('#profileEdit').click(function() {
            $('#profileModalTitle').html('Edit Profile');
            $('#profileModalName').val(profiles.current);
            $('#profileModalAdd').hide();
            $('#profileModalUpdate').show();
            if (canDelete()) {
                $('#profileModalDelete').show();
            } else {
                $('#profileModalDelete').hide();
            }
            $('#profileModal').modal('show');
            _gaq.push(['_trackEvent', 'Profile', 'Edit', profiles.current]);
        });

        $('#profileModalAdd').click(function(event) {
            event.preventDefault();
            var profile = $.trim($('#profileModalName').val());
            if (profile.length > 0) {
                if (typeof profiles.profiles[profile] == 'undefined') {
                    profiles.profiles[profile] = { checklistData: {} };
                }
                profiles.current = profile;
                $.jStorage.set('profiles', profiles);
                populateProfiles();
                populateChecklists();
            }
            $('#profileModal').modal('hide');
            _gaq.push(['_trackEvent', 'Profile', 'Create', profile]);
        });

        $('#profileModalUpdate').click(function(event) {
            event.preventDefault();
            var newName = $.trim($('#profileModalName').val());
            if (newName.length > 0 && newName != profiles.current) {
                profiles.profiles[newName] = profiles.profiles[profiles.current];
                delete profiles.profiles[profiles.current];
                profiles.current = newName;
                $.jStorage.set('profiles', profiles);
                populateProfiles();
            }
            $('#profileModal').modal('hide');
            _gaq.push(['_trackEvent', 'Profile', 'Update', profile]);
        });

        $('#profileModalDelete').click(function(event) {
            event.preventDefault();
            if (!canDelete()) {
                return;
            }
            if (!confirm('Are you sure?')) {
                return;
            }
            delete profiles.profiles[profiles.current];
            profiles.current = getFirstProfile();
            $.jStorage.set('profiles', profiles);
            populateProfiles();
            populateChecklists();
            $('#profileModal').modal('hide');
            _gaq.push(['_trackEvent', 'Profile', 'Delete']);
        });

        $('#profileModalClose').click(function(event) {
            event.preventDefault();
            $('#profileModal').modal('hide');
            _gaq.push(['_trackEvent', 'Profile', 'Close']);
        });

    });

    function populateProfiles() {
        $('#profiles').empty();
        $.each(profiles.profiles, function(index, value) {
            $('#profiles').append($("<option></option>").attr('value', index).text(index));
        });
        $('#profiles').val(profiles.current);
    }

    function populateChecklists() {
        $('input[type="checkbox"]').prop('checked', false);
        $.each(profiles.profiles[profiles.current].checklistData, function(index, value) {
            $('#' + index).prop('checked', value);
        });
    }

    function addCheckbox(el) {
        //console.log($(el).attr('data-id'));
        var lines = $(el).html().split('\n');
        lines[0] = '<label class="checkbox"><input type="checkbox" id="' + $(el).attr('data-id') + '">' + lines[0] + '</label>';
        $(el).html(lines.join('\n'));
        if (profiles.profiles[profiles.current].checklistData[$(el).attr('data-id')] == true) {
            $('#' + $(el).attr('data-id')).prop('checked', true);
        }
    }

    function canDelete() {
        var count = 0;
        $.each(profiles.profiles, function(index, value) {
            count++;
        });
        return (count > 1);
    }

    function getFirstProfile() {
        for (var profile in profiles.profiles) {
            return profile;
        }
    }

})( jQuery );
