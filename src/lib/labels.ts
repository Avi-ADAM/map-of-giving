import { m } from '$lib/paraglide/messages.js';
import type { Category, ReportKind } from './domain';
import { DESCRIPTION_MAX, HINT_MAX, type FieldError } from './listing-validation';

const categoryMessages: Record<Category, () => string> = {
	food: m.category_food,
	furniture: m.category_furniture,
	clothing: m.category_clothing,
	kids: m.category_kids,
	household: m.category_household,
	other: m.category_other
};

const reportMessages: Record<ReportKind, () => string> = {
	still_there: m.report_still_there,
	taken: m.report_taken,
	not_found: m.report_not_found,
	unusable: m.report_unusable
};

export const categoryLabel = (category: Category) => categoryMessages[category]();

export const reportLabel = (kind: ReportKind) => reportMessages[kind]();

export function fieldErrorMessage(error: FieldError): string {
	switch (error) {
		case 'category_required':
			return m.error_category_required();
		case 'location_required':
			return m.error_location_required();
		case 'description_required':
			return m.error_description_required();
		case 'description_too_long':
			return m.error_description_too_long({ max: DESCRIPTION_MAX });
		case 'hint_too_long':
			return m.error_hint_too_long({ max: HINT_MAX });
	}
}
