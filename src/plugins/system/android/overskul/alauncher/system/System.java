package overskul.alauncher.system;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;

public class System extends com.foxdebug.system.System {

    @Override
    public boolean execute(
        String action,
        final JSONArray args,
        final CallbackContext callbackContext
    ) throws JSONException {
        switch (action) {
            case "selectDefaultLauncher":
                selectDefaultLauncher(callbackContext);
                return true;
            case "getDefaultLauncher":
                getDefaultLauncher(callbackContext);
                return true;
            case "isDefaultLauncher":
                callbackContext.success(isDefaultLauncher() ? 1 : 0);
                return true;
            default:
                return super.execute(action, args, callbackContext);
        }
    }

    private void selectDefaultLauncher(CallbackContext callbackContext) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                Intent intent = new Intent(Settings.ACTION_HOME_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                cordova.getContext().startActivity(intent);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                clearCurrentLauncherDefault();
                Intent homeIntent = buildHomeIntent();
                homeIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                cordova.getContext().startActivity(Intent.createChooser(homeIntent, "Select default launcher"));
            } else {
                Intent homeIntent = buildHomeIntent();
                homeIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                cordova.getContext().startActivity(homeIntent);
            }
            callbackContext.success();
        } catch (Exception e) {
            Log.e("System", "selectDefaultLauncher failed", e);
            callbackContext.error("Failed to open launcher selector: " + e.getMessage());
        }
    }

    private void getDefaultLauncher(CallbackContext callbackContext) {
        try {
            String packageName = resolveDefaultLauncherPackage();
            callbackContext.success(packageName != null ? packageName : "");
        } catch (Exception e) {
            Log.e("System", "getDefaultLauncher failed", e);
            callbackContext.error("Failed to get default launcher: " + e.getMessage());
        }
    }

    private boolean isDefaultLauncher() {
        try {
            String defaultPkg = resolveDefaultLauncherPackage();
            return cordova.getContext().getPackageName().equals(defaultPkg);
        } catch (Exception e) {
            Log.e("System", "isDefaultLauncher failed", e);
            return false;
        }
    }

    private String resolveDefaultLauncherPackage() {
        PackageManager pm = cordova.getContext().getPackageManager();
        android.content.pm.ResolveInfo info =
            pm.resolveActivity(buildHomeIntent(), PackageManager.MATCH_DEFAULT_ONLY);
        return (info != null && info.activityInfo != null)
            ? info.activityInfo.packageName
            : null;
    }

    private Intent buildHomeIntent() {
        Intent intent = new Intent(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_HOME);
        return intent;
    }

    private void clearCurrentLauncherDefault() {
        try {
            String currentDefault = resolveDefaultLauncherPackage();
            if (currentDefault != null) {
                cordova.getContext()
                    .getPackageManager()
                    .clearPackagePreferredActivities(currentDefault);
            }
        } catch (Exception e) {
            Log.w("System", "Could not clear current launcher default: " + e.getMessage());
        }
    }
}
