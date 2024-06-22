const { ZodError } = require("zod");

const zod_validation_errors = (error) => {
    if (error instanceof ZodError) {

        const error_list = {};

        error.issues.map(issue => {

            error_list[issue.path[0]] = [issue.message];
        });

        return {errors: error_list};
    }
}

module.exports = { zod_validation_errors };