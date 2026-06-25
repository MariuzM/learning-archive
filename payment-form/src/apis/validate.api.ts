import axios from 'axios'

export const API_GET_ValidateIban = async (iban: string) => {
	const res = await axios.get<{ iban: string; valid: boolean }>(
		`https://matavi.eu/validate/?iban=${iban}`,
	)
	return res.data
}
