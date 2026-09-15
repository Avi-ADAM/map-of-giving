import { m } from '$lib/paraglide/messages.js';
import type { Category, ReportKind, SpotVisitOutcome } from './domain';
import { DESCRIPTION_MAX, HINT_MAX, type FieldError } from './listing-validation';
import type { SpotVerdict } from './spot-rating';

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

const visitMessages: Record<SpotVisitOutcome, () => string> = {
	found: m.spot_visit_found,
	empty: m.spot_visit_empty,
	unusable: m.spot_visit_unusable,
	stopped: m.spot_visit_stopped
};

const verdictMessages: Record<SpotVerdict, () => string> = {
	often: m.spot_verdict_often,
	sometimes: m.spot_verdict_sometimes,
	rarely: m.spot_verdict_rarely,
	unknown: m.spot_verdict_unknown
};

export const SPOT_VERDICT_EMOJI: Record<SpotVerdict, string> = {
	often: '👍',
	sometimes: '🤞',
	rarely: '👎',
	unknown: '❔'
};

export const categoryLabel = (category: Category) => categoryMessages[category]();

export const reportLabel = (kind: ReportKind) => reportMessages[kind]();

export const visitLabel = (outcome: SpotVisitOutcome) => visitMessages[outcome]();

export const verdictLabel = (verdict: SpotVerdict) => verdictMessages[verdict]();

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
