package com.vulntrack.config;

import com.vulntrack.dto.ErrorResponseDto;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String ERROR_SCHEMA_NAME = "ErrorResponseDto";
    private static final String ERROR_SCHEMA_REF = "#/components/schemas/" + ERROR_SCHEMA_NAME;

    @Bean
    public OpenAPI vulntrackOpenAPI() {
        final String securitySchemeName = "basicAuth";

        return new OpenAPI()
            .info(new Info()
                .title("VulnTrack API")
                .description("Vulnerability Management & Asset Tracking REST API with Spring Security RBAC. " +
                    "Error responses follow a standard envelope: timestamp, status, error, machine-readable code " +
                    "(RESOURCE_NOT_FOUND, BAD_REQUEST, VALIDATION_FAILED, FORBIDDEN, INTERNAL_SERVER_ERROR), message, path, " +
                    "and per-field validationErrors where applicable. " +
                    "This local development deployment does not enforce rate limiting; requests are only bounded by " +
                    "Kubernetes resource quotas and HPA scaling when deployed via Helm.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("VulnTrack DevOps Team")
                    .email("student@university.edu"))
                .license(new License().name("Apache 2.0").url("https://www.apache.org/licenses/LICENSE-2.0")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("basic")
                        .description("HTTP Basic Authentication using role credentials: 'admin' (read-write) or 'viewer' (read-only).")));
    }

    @Bean
    public GlobalOpenApiCustomizer globalErrorResponsesCustomizer() {
        return openApi -> {
            Components components = openApi.getComponents();
            if (components.getSchemas() == null) {
                components.setSchemas(new java.util.HashMap<>());
            }
            components.getSchemas().putAll(ModelConverters.getInstance().read(ErrorResponseDto.class));

            components.addResponses("BadRequest",
                errorResponse("Bad Request - validation failed, invalid parameter type, or malformed body"));
            components.addResponses("Unauthorized",
                errorResponse("Unauthorized - missing or invalid basic auth credentials"));
            components.addResponses("Forbidden",
                errorResponse("Forbidden - authenticated but insufficient role (e.g. viewer attempting a mutation)"));
            components.addResponses("NotFound",
                errorResponse("Not Found - no resource exists for the given ID"));
            components.addResponses("InternalServerError",
                errorResponse("Internal Server Error - unexpected failure; details are logged server-side only"));

            if (openApi.getPaths() == null) {
                return;
            }

            openApi.getPaths().forEach((path, pathItem) -> {
                boolean hasPathId = path.contains("{id}");
                pathItem.readOperationsMap().forEach((method, operation) ->
                    attachErrorResponses(operation, hasPathId, method != PathItem.HttpMethod.GET));
            });
        };
    }

    private void attachErrorResponses(Operation operation, boolean hasPathId, boolean isMutation) {
        operation.getResponses().addApiResponse("400",
            new ApiResponse().$ref("#/components/responses/BadRequest"));
        operation.getResponses().addApiResponse("401",
            new ApiResponse().$ref("#/components/responses/Unauthorized"));
        operation.getResponses().addApiResponse("500",
            new ApiResponse().$ref("#/components/responses/InternalServerError"));
        if (isMutation) {
            operation.getResponses().addApiResponse("403",
                new ApiResponse().$ref("#/components/responses/Forbidden"));
        }
        if (hasPathId) {
            operation.getResponses().addApiResponse("404",
                new ApiResponse().$ref("#/components/responses/NotFound"));
        }
        if (operation.getParameters() != null) {
            operation.getParameters().stream()
                .filter(param -> "id".equals(param.getName()))
                .forEach(param -> param.setExample(3L));
        }
    }

    private ApiResponse errorResponse(String description) {
        Content content = new Content().addMediaType("application/json",
            new MediaType().schema(new Schema<>().$ref(ERROR_SCHEMA_REF)));
        return new ApiResponse().description(description).content(content);
    }
}
