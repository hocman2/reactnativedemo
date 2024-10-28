import { ApplicationProvider } from "@ui-kitten/components"
import { Slot } from "expo-router"
import * as eva from "@eva-design/eva"
import {customTheme} from "@/custom-theme"

export default () => {
	return (
		<ApplicationProvider {...eva} theme={{...eva.light, ...customTheme}}>
			<Slot/>
		</ApplicationProvider>
	)
}
