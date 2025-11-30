import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database"

type Category = Database["public"]["Tables"]["categories"]["Row"]
type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]

export function useReferenceData() {
  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const [categoriesRes, paymentMethodsRes] = await Promise.all([
          supabase.from("categories").select("*").or(`user_id.eq.${user.id},is_default.eq.true`),
          supabase.from("payment_methods").select("*")
        ])

        if (categoriesRes.error) throw categoriesRes.error
        if (paymentMethodsRes.error) throw paymentMethodsRes.error

        setCategories(categoriesRes.data)
        setPaymentMethods(paymentMethodsRes.data)
      } catch (error) {
        console.error("Error fetching reference data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    categories,
    paymentMethods,
    loading,
  }
}
