import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
// Use __() and N__() for the extension gettext domain, and reuse
// the shell domain with the default _() and N_()

import {
    ExtensionPreferences,
    gettext as __,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
const N__ = function (e) {
    return e;
};

export default class Prefs extends ExtensionPreferences {
    /**
     * Creates a new Settings-object to access the settings of this extension.
     * @private
     */
    constructor(metadata) {
        super(metadata);
        this.KEY_HIBERNATE_WORKS_CHECK = 'hibernate-works-check';
        this._schemaName = 'org.gnome.shell.extensions.hibernate-status-button';
        this._setting = this.getSettings()
    }
    /**
     * <p>Binds the given 'callback'-function to the "changed"-signal on the given
     *  key.</p>
     * <p>The 'callback'-function is passed an argument which holds the new
     *  value of 'key'. The argument is of type "GLib.Variant". Given that the
     *  receiver knows the internal type, use one of the get_XX()-methods to get
     *  it's actual value.</p>
     * @see http://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/GLib.Variant.html
     * @param key the key to watch for changes.
     * @param callback the callback-function to call.
     */
    bindKey(key, callback) {
        // Validate:
        if (key === undefined || key === null || typeof key !== 'string') {
            throw TypeError("The 'key' should be a string. Got: '" + key + "'");
        }
        if (
            callback === undefined ||
            callback === null ||
            typeof callback !== 'function'
        ) {
            throw TypeError(
                "'callback' needs to be a function. Got: " + callback
            );
        }
        // Bind:
        this._setting.connect('changed::' + key, function (source, key) {
            callback(source.get_value(key));
        });
    }
    /**
     * Get if check for working hibernation is enabled. The user might
     * choose to disable it if we happen to be wrong.
     *
     * @returns bool true if we need to check if hibernation works.
     */
    getHibernateWorksCheckEnabled() {
        return this._setting.get_boolean(this.KEY_HIBERNATE_WORKS_CHECK);
    }
    /**
     * Set if check for working hibernation is enabled. The user might
     * choose to disable it if we happen to be wrong.
     *
     * @returns bool true if we need to check if hibernation works.
     */
    setHibernateWorksCheckEnabled(enabled) {
        let key = this.KEY_HIBERNATE_WORKS_CHECK;
        if (this._setting.is_writable(key)) {
            if (this._setting.set_boolean(key, enabled)) {
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    }
    _errorWritable(key) {
        return "The key '" + key + "' is not writable.";
    }
    _errorSet(key) {
        return "Couldn't set the key '" + key + "'";
    }
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: __('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: __('Modes'),
            description: __('Which buttons should be enabled'),
        });
        page.add(group);

        // Create a new preferences row
        const hibernate_row = new Adw.SwitchRow({
            title: __('Hibernate'),
        });
        group.add(hibernate_row);
        const hybrid_row = new Adw.SwitchRow({
            title: __('Hybrid sleep'),
        });
        group.add(hybrid_row);
        const suspend_then_hibernate_row = new Adw.SwitchRow({
            title: __('Suspend then hibernate'),
        });
        group.add(suspend_then_hibernate_row);

        window._settings = this.getSettings();
        window._settings.bind('show-hibernate', hibernate_row, 'active',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('show-hybrid-sleep', hybrid_row, 'active',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('show-suspend-then-hibernate', suspend_then_hibernate_row, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
