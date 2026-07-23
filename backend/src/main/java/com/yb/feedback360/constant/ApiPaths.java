package com.yb.feedback360.constant;

public final class ApiPaths {

    private ApiPaths() {
    }

    public static final String AUTHENTICATION = "/api/auth";
    public static final String INTEGRATIONS = "/api/integrations";
    public static final String FEEDBACKS = "/api/feedbacks";

    public static final String ERROR = "/error";

    public static final String AUTHENTICATION_PATTERN = AUTHENTICATION + "/**";
    public static final String INTEGRATIONS_PATTERN = INTEGRATIONS + "/**";

    // endpoint sub-paths
    public static final String LOGIN = "/login";
    public static final String ACTIVATE = "/activate";
    public static final String MODULE_COMPLETED = "/module-completed";
    public static final String BY_ID = "/{feedbackId}";

    public static final String SUBMIT = "/{feedbackId}/submit";

    public static final String SUMMARY = "/summary";

    // Manager/RH global views
    public static final String MANAGEMENT = "/api/management";
    public static final String MANAGEMENT_PATTERN = MANAGEMENT + "/**";
    public static final String MANAGEMENT_FEEDBACKS = "/feedbacks";
    public static final String MANAGEMENT_FEEDBACKS_SUMMARY = "/feedbacks/summary";
    public static final String MANAGEMENT_FEEDBACKS_STATS = "/feedbacks/stats";

    // Admin user & config management
    public static final String ADMIN = "/api/admin";
    public static final String ADMIN_PATTERN = ADMIN + "/**";
    public static final String ADMIN_USERS = "/users";
}
